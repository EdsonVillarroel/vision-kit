import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string; tenantId?: string }>();
    const requestId = request.id || (request.headers['x-request-id'] as string | undefined);

    const { status, body } = this.toResponse(exception);
    body.requestId = requestId;

    // Sentry y log-error solo para "true unhandled": errores que NO son
    // HttpException (lanzar HttpException es comportamiento intencional, ej.
    // ServiceUnavailableException del /health cuando la DB está caída).
    // Los 5xx ya se logguean por nestjs-pino vía customLogLevel.
    const isTrueUnhandled = !(exception instanceof HttpException);
    if (isTrueUnhandled) {
      this.logger.error(
        { err: exception, requestId, tenantId: request.tenantId, path: request.url },
        'Unhandled exception',
      );
      Sentry.withScope((scope) => {
        scope.setTag('requestId', requestId ?? 'unknown');
        if (request.tenantId) scope.setTag('tenantId', request.tenantId);
        scope.setExtra('path', request.url);
        scope.setExtra('method', request.method);
        Sentry.captureException(exception);
      });
    }

    response.status(status).json(body);
  }

  private toResponse(exception: unknown): { status: number; body: ErrorBody } {
    // 1. Excepciones HTTP de Nest (BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        return {
          status,
          body: {
            statusCode: status,
            error: (obj.error as string) || HttpStatus[status] || 'Error',
            message: (obj.message as string | string[]) || exception.message,
          },
        };
      }
      return {
        status,
        body: {
          statusCode: status,
          error: HttpStatus[status] || 'Error',
          message: typeof res === 'string' ? res : exception.message,
        },
      };
    }

    // 2. Errores conocidos de Prisma → mapeo seguro a HTTP, sin filtrar SQL
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const target = (exception.meta?.target as string[] | undefined)?.join(', ');
          return {
            status: HttpStatus.CONFLICT,
            body: {
              statusCode: HttpStatus.CONFLICT,
              error: 'Conflict',
              message: target ? `Ya existe un registro con ${target}` : 'Registro duplicado',
            },
          };
        }
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            body: {
              statusCode: HttpStatus.NOT_FOUND,
              error: 'Not Found',
              message: 'Registro no encontrado',
            },
          };
        case 'P2003':
          return {
            status: HttpStatus.BAD_REQUEST,
            body: {
              statusCode: HttpStatus.BAD_REQUEST,
              error: 'Bad Request',
              message: 'Referencia inválida a otro registro',
            },
          };
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Datos inválidos para la operación',
        },
      };
    }

    // 3. Cualquier otro Error → 500 sin filtrar internals al cliente
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Error interno del servidor',
      },
    };
  }
}
