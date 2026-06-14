import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { TenantPrismaService } from './tenant-prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY, TENANT_SCOPED_MODELS } from './tenant.constants';

// ─────────────────────────────────────────────────────────────────────────────
// Mock de prisma.$extends
//
// Simula el comportamiento de Prisma Client Extensions: cuando código en
// producción llama `client.patient.findMany(args)`, este mock invoca el
// callback `$allOperations` registrado por TenantPrismaService con
// { model: 'Patient', operation: 'findMany', args, query }, y devuelve los
// args mutados que llegan al `query` final.
//
// Esto nos permite verificar exactamente qué args terminarían ejecutándose
// contra la DB, que es lo único que importa para validar aislamiento.
// ─────────────────────────────────────────────────────────────────────────────
function buildMockPrisma() {
  let allOpsCallback:
    | ((p: { model: string; operation: string; args: unknown; query: (a: unknown) => Promise<unknown> }) => Promise<unknown>)
    | null = null;

  const mock = {
    $extends: (extension: {
      query: { $allModels: { $allOperations: typeof allOpsCallback } };
    }) => {
      allOpsCallback = extension.query.$allModels.$allOperations;
      return new Proxy(
        {},
        {
          get: (_target, modelLower: string) =>
            new Proxy(
              {},
              {
                get: (_t, operation: string) => (args: unknown) => {
                  const Model = modelLower.charAt(0).toUpperCase() + modelLower.slice(1);
                  return allOpsCallback!({
                    model: Model,
                    operation,
                    args,
                    // El "query" real ejecuta la op contra la DB; aquí solo
                    // capturamos los args para que el test los inspeccione.
                    query: (finalArgs) => Promise.resolve({ __captured: finalArgs }),
                  });
                },
              },
            ),
        },
      );
    },
  };

  return mock;
}

describe('TenantPrismaService — aislamiento multi-tenant', () => {
  let service: TenantPrismaService;
  let cls: { get: jest.Mock };

  const TENANT = 'tenant-A';

  beforeEach(async () => {
    cls = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPrismaService,
        { provide: PrismaService, useValue: buildMockPrisma() },
        { provide: ClsService, useValue: cls },
      ],
    }).compile();

    service = module.get(TenantPrismaService);
    service.onModuleInit();
  });

  // Ejecuta `client.<modelLower>.<op>(args)` con tenantId en CLS y devuelve
  // los args finales que habrían llegado a la DB.
  // Pasar `null` como tenantId simula "sin contexto" (default es TENANT).
  const runWithTenant = async (
    modelLower: string,
    operation: string,
    args: Record<string, unknown>,
    tenantId: string | null = TENANT,
  ): Promise<Record<string, unknown>> => {
    cls.get.mockImplementation((key) =>
      key === TENANT_ID_KEY ? tenantId ?? undefined : undefined,
    );
     
    const client = service.client as any;
    const result = await client[modelLower][operation](args);
    return (result as { __captured: Record<string, unknown> }).__captured;
  };

  // ── Lecturas: tenantId debe inyectarse en where ─────────────────────────
  describe.each(['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'])(
    'operación de lectura "%s"',
    (op) => {
      it(`inyecta tenantId en where para Patient.${op}`, async () => {
        const args = await runWithTenant('patient', op, { where: { name: 'Maria' } });
        expect(args.where).toEqual({ name: 'Maria', tenantId: TENANT });
      });

      it(`inyecta tenantId aunque where esté vacío en ${op}`, async () => {
        const args = await runWithTenant('sale', op, {});
        expect(args.where).toEqual({ tenantId: TENANT });
      });
    },
  );

  // ── Mutaciones: where ────────────────────────────────────────────────────
  describe.each(['update', 'updateMany', 'delete', 'deleteMany'])(
    'operación de mutación "%s"',
    (op) => {
      it(`inyecta tenantId en where para Product.${op}`, async () => {
        const args = await runWithTenant('product', op, {
          where: { id: 'p-123' },
          data: { name: 'X' },
        });
        expect(args.where).toEqual({ id: 'p-123', tenantId: TENANT });
      });
    },
  );

  // ── Creación: tenantId va en data ───────────────────────────────────────
  it('inyecta tenantId en data para create', async () => {
    const args = await runWithTenant('patient', 'create', { data: { name: 'Juan' } });
    expect(args.data).toEqual({ name: 'Juan', tenantId: TENANT });
  });

  it('inyecta tenantId en cada item de createMany (array)', async () => {
    const args = await runWithTenant('saleItem', 'createMany', {
      data: [
        { saleId: 's1', productName: 'A' },
        { saleId: 's2', productName: 'B' },
      ],
    });
    expect(args.data).toEqual([
      { saleId: 's1', productName: 'A', tenantId: TENANT },
      { saleId: 's2', productName: 'B', tenantId: TENANT },
    ]);
  });

  // ── Upsert: where + create deben tener tenantId; update no toca ─────────
  it('inyecta tenantId en where y create del upsert (no en update)', async () => {
    const args = await runWithTenant('clinicSettings', 'upsert', {
      where: { id: 'cs-1' },
      create: { theme: 'dark' },
      update: { theme: 'light' },
    });
    expect(args.where).toEqual({ id: 'cs-1', tenantId: TENANT });
    expect(args.create).toEqual({ theme: 'dark', tenantId: TENANT });
    expect(args.update).toEqual({ theme: 'light' }); // intacto
  });

  // ── Modelos NO scoped: nunca debe inyectar ──────────────────────────────
  it('NO inyecta tenantId en modelos no scoped (Tenant)', async () => {
    cls.get.mockReturnValue(TENANT);
     
    const client = service.client as any;
    const result = await client.tenant.findMany({ where: { slug: 'foo' } });
    expect(result.__captured).toEqual({ where: { slug: 'foo' } });
  });

  it('NO inyecta tenantId en SubscriptionPlan', async () => {
    cls.get.mockReturnValue(TENANT);
     
    const client = service.client as any;
    const result = await client.subscriptionPlan.findMany({});
    expect(result.__captured).toEqual({});
  });

  // ── Sin tenantId en CLS → pasa sin filtro (rutas públicas/scripts) ──────
  it('NO inyecta tenantId si no hay contexto CLS (ruta pública / script)', async () => {
    const args = await runWithTenant('patient', 'findMany', { where: { name: 'X' } }, null);
    expect(args.where).toEqual({ name: 'X' });
  });

  // ── findUnique: Prisma rompe si se inyecta en where compuesto ───────────
  it('NO inyecta tenantId en findUnique (rompería unique constraints)', async () => {
    const args = await runWithTenant('patient', 'findUnique', { where: { id: 'p-1' } });
    expect(args.where).toEqual({ id: 'p-1' });
  });

  // ── Cobertura: el test de scoped-models cubre la lista entera ───────────
  it('todos los TENANT_SCOPED_MODELS reciben inyección de tenantId en findMany', async () => {
    for (const Model of TENANT_SCOPED_MODELS) {
      const modelLower = Model.charAt(0).toLowerCase() + Model.slice(1);
      const args = await runWithTenant(modelLower, 'findMany', {});
      expect(args.where).toEqual({ tenantId: TENANT });
    }
  });
});
