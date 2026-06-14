import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { PlanQuotaGuard } from './plan-quota.guard';
import { PrismaService } from '../prisma/prisma.service';
import { QUOTA_METADATA_KEY, QuotaResource } from './quota-limit.decorator';

describe('PlanQuotaGuard', () => {
  let guard: PlanQuotaGuard;
  let reflector: { get: jest.Mock };
  let cls: { get: jest.Mock };
  let prisma: {
    subscription: { findFirst: jest.Mock };
    patient: { count: jest.Mock };
    product: { count: jest.Mock };
    user: { count: jest.Mock };
    sale: { count: jest.Mock };
  };

  const buildCtx = (): ExecutionContext =>
    ({
      getHandler: () => () => undefined,
    }) as unknown as ExecutionContext;

  const setQuotaMeta = (resource: QuotaResource | undefined) => {
    reflector.get.mockImplementation((key) => (key === QUOTA_METADATA_KEY ? resource : undefined));
  };

  beforeEach(async () => {
    reflector = { get: jest.fn() };
    cls = { get: jest.fn() };
    prisma = {
      subscription: { findFirst: jest.fn() },
      patient: { count: jest.fn() },
      product: { count: jest.fn() },
      user: { count: jest.fn() },
      sale: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanQuotaGuard,
        { provide: Reflector, useValue: reflector },
        { provide: ClsService, useValue: cls },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(PlanQuotaGuard);
  });

  it('pasa si el handler no tiene @QuotaLimit', async () => {
    setQuotaMeta(undefined);

    await expect(guard.canActivate(buildCtx())).resolves.toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('pasa si no hay tenantId en CLS (rutas sin tenant)', async () => {
    setQuotaMeta('patients');
    cls.get.mockReturnValue(undefined);

    await expect(guard.canActivate(buildCtx())).resolves.toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('lanza 402 si no hay suscripción activa', async () => {
    setQuotaMeta('patients');
    cls.get.mockReturnValue('tenant-A');
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(guard.canActivate(buildCtx())).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
  });

  it('pasa si el plan tiene UNLIMITED (-1) en el recurso', async () => {
    setQuotaMeta('patients');
    cls.get.mockReturnValue('tenant-A');
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { maxUsers: 5, maxPatients: -1, maxProducts: 100, slug: 'pro', name: 'Pro', features: {} },
    });

    await expect(guard.canActivate(buildCtx())).resolves.toBe(true);
    expect(prisma.patient.count).not.toHaveBeenCalled();
  });

  it('pasa si el conteo está dentro del límite', async () => {
    setQuotaMeta('patients');
    cls.get.mockReturnValue('tenant-A');
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { maxUsers: 5, maxPatients: 100, maxProducts: 100, slug: 'pro', name: 'Pro', features: {} },
    });
    prisma.patient.count.mockResolvedValue(50);

    await expect(guard.canActivate(buildCtx())).resolves.toBe(true);
    expect(prisma.patient.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-A' } });
  });

  it('lanza 402 con body PlanQuotaExceeded al exceder límite', async () => {
    setQuotaMeta('patients');
    cls.get.mockReturnValue('tenant-A');
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { maxUsers: 5, maxPatients: 100, maxProducts: 100, slug: 'pro', name: 'Pro', features: {} },
    });
    prisma.patient.count.mockResolvedValue(100);

    try {
      await guard.canActivate(buildCtx());
      throw new Error('Should have thrown');
    } catch (err: unknown) {
      const e = err as { status: number; response: Record<string, unknown> };
      expect(e.status).toBe(HttpStatus.PAYMENT_REQUIRED);
      expect(e.response).toMatchObject({
        error: 'PlanQuotaExceeded',
        resource: 'patients',
        current: 100,
        limit: 100,
        planSlug: 'pro',
      });
    }
  });

  it('sales_per_month lee features.max_sales_per_month del plan', async () => {
    setQuotaMeta('sales_per_month');
    cls.get.mockReturnValue('tenant-A');
    prisma.subscription.findFirst.mockResolvedValue({
      plan: {
        maxUsers: 5,
        maxPatients: 100,
        maxProducts: 100,
        slug: 'basic',
        name: 'Basic',
        features: { max_sales_per_month: 50 },
      },
    });
    prisma.sale.count.mockResolvedValue(50);

    await expect(guard.canActivate(buildCtx())).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
    // El count debe filtrar por tenantId + createdAt >= startOfMonth
    const callArg = prisma.sale.count.mock.calls[0][0];
    expect(callArg.where.tenantId).toBe('tenant-A');
    expect(callArg.where.createdAt.gte).toBeInstanceOf(Date);
  });
});
