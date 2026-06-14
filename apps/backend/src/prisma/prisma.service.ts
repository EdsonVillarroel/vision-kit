import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Conexión no-bloqueante: si la DB está temporalmente caída, dejamos que
    // el server arranque para que /health reporte 'degraded' en lugar de crash-loop.
    // Prisma reintentará en la primera query.
    try {
      await this.$connect();
      this.logger.log('Prisma conectado a la DB');
    } catch (err) {
      this.logger.error(
        `Prisma no pudo conectar al boot: ${err instanceof Error ? err.message : err}. Se reintentará en queries.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
