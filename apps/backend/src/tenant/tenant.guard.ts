import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_ID_KEY } from './tenant.constants';

/**
 * Guard que verifica que el contexto de tenant esté presente.
 * Usar en endpoints que requieren aislamiento explícito por tenant.
 * Normalmente no hace falta: TenantPrismaService ya filtra automáticamente.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly cls: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const tenantId = this.cls.get<string | undefined>(TENANT_ID_KEY);

    if (!tenantId) {
      throw new ForbiddenException('Tenant context requerido');
    }

    // Verificación cross-tenant: el tenantId del request debe coincidir con el del token
    const request = context
      .switchToHttp()
      .getRequest<{ params?: { tenantId?: string } }>();

    if (request.params?.tenantId && request.params.tenantId !== tenantId) {
      throw new ForbiddenException('Acceso denegado a otro tenant');
    }

    return true;
  }
}
