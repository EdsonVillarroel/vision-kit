import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el tenantId del request (puesto por TenantClsMiddleware).
 * Uso: @CurrentTenant() tenantId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ tenantId?: string }>();
    return request.tenantId;
  },
);
