import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { SubscriptionGuard } from './subscription.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY } from './tenant.constants';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let cls: { get: jest.Mock };
  let prisma: { tenant: { findUnique: jest.Mock } };

  const ctx = {} as ExecutionContext;

  beforeEach(async () => {
    cls = { get: jest.fn() };
    prisma = { tenant: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionGuard,
        { provide: ClsService, useValue: cls },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(SubscriptionGuard);
  });

  it('deja pasar requests sin tenantId (rutas public/platform)', async () => {
    cls.get.mockReturnValue(undefined);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('deja pasar tenant con suscripción active', async () => {
    cls.get.mockImplementation((key) => (key === TENANT_ID_KEY ? 'tenant-A' : undefined));
    prisma.tenant.findUnique.mockResolvedValue({ status: 'active' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('lanza HTTP 402 con tenant suspended', async () => {
    cls.get.mockImplementation((key) => (key === TENANT_ID_KEY ? 'tenant-B' : undefined));
    prisma.tenant.findUnique.mockResolvedValue({ status: 'suspended' });

    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(HttpException);
  });

  it('lanza HTTP 402 cuando el tenant no existe (status fallback = cancelled)', async () => {
    cls.get.mockImplementation((key) => (key === TENANT_ID_KEY ? 'tenant-X' : undefined));
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });
  });

  it('cachea el resultado por 5 min — segundo hit no consulta DB', async () => {
    cls.get.mockImplementation((key) => (key === TENANT_ID_KEY ? 'tenant-cache' : undefined));
    prisma.tenant.findUnique.mockResolvedValue({ status: 'active' });

    await guard.canActivate(ctx);
    await guard.canActivate(ctx);
    await guard.canActivate(ctx);

    expect(prisma.tenant.findUnique).toHaveBeenCalledTimes(1);
  });
});
