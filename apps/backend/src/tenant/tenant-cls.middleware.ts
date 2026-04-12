import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY } from './tenant.constants';

interface JwtPayload {
  sub?: string;
  email?: string;
  tenantId?: string;
}

/**
 * Extrae el tenantId del JWT y lo almacena en CLS + request.
 *
 * Estrategia dual:
 *  1. Si el JWT ya incluye tenantId (Sesión 4+) → usarlo directamente.
 *  2. Si el JWT solo tiene sub (estado actual) → consultar DB para obtener tenantId del usuario.
 *
 * Nota: decodificamos sin verificar (solo parseo) porque la verificación
 * criptográfica la hace JwtAuthGuard en el paso siguiente del ciclo de vida.
 */
@Injectable()
export class TenantClsMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (decoded) {
        let tenantId = decoded.tenantId;

        // Fallback: buscar tenantId del usuario en DB (hasta que Sesión 4 actualice el JWT)
        if (!tenantId && decoded.sub) {
          const user = await this.prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { tenantId: true },
          });
          tenantId = user?.tenantId ?? undefined;
        }

        if (tenantId) {
          this.cls.set(TENANT_ID_KEY, tenantId);
          (req as Request & { tenantId: string }).tenantId = tenantId;
        }
      }
    }

    next();
  }
}
