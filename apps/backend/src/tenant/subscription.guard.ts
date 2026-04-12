import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY } from './tenant.constants';

interface CacheEntry {
  status: string;
  expiresAt: number;
}

/**
 * Guard que verifica que la suscripción del tenant esté activa.
 * Registrado globalmente en AppModule — solo actúa cuando hay tenantId en CLS.
 * Rutas públicas (/public/:slug/...) y de plataforma (/platform/...) no tienen
 * tenantId en CLS (no llevan JWT de tenant), por lo que pasan sin verificación.
 *
 * Cachea el estado del tenant por 5 minutos para evitar un hit DB por cada request.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const tenantId = this.cls.get<string | undefined>(TENANT_ID_KEY);

    // Sin tenantId → ruta pública o de plataforma → dejar pasar
    if (!tenantId) return true;

    const now = Date.now();
    const cached = this.cache.get(tenantId);

    if (cached && cached.expiresAt > now) {
      if (cached.status !== 'active') {
        this.throwSuspended();
      }
      return true;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true },
    });

    const status = tenant?.status ?? 'cancelled';
    this.cache.set(tenantId, { status, expiresAt: now + this.TTL_MS });

    if (status !== 'active') {
      this.throwSuspended();
    }

    return true;
  }

  private throwSuspended(): never {
    throw new HttpException(
      'Suscripción inactiva. Contacta con soporte para activar tu cuenta.',
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
