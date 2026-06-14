import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness + DB check para load balancers / uptime monitors' })
  async check() {
    const checks: Record<string, { status: 'ok' | 'fail'; latencyMs?: number; error?: string }> = {};

    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch (err) {
      checks.database = {
        status: 'fail',
        latencyMs: Date.now() - dbStart,
        error: err instanceof Error ? err.message : 'unknown',
      };
    }

    const allOk = Object.values(checks).every((c) => c.status === 'ok');
    const body = {
      status: allOk ? 'ok' : 'degraded',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks,
    };

    if (!allOk) throw new ServiceUnavailableException(body);
    return body;
  }
}
