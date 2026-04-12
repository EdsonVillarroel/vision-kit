import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_ID_KEY, TENANT_SCOPED_MODELS } from './tenant.constants';

/**
 * TenantPrismaService — cliente Prisma tenant-aware.
 *
 * Extiende PrismaService con un query extension que auto-inyecta tenantId
 * en todas las operaciones sobre tablas de negocio. El tenantId se lee de CLS
 * (continuation-local storage) en el momento de ejecutar cada query, por lo que
 * un único cliente extendido sirve para todas las requests concurrentes.
 *
 * Uso en services (a partir de Sesión 6):
 *   constructor(private readonly tenantPrisma: TenantPrismaService) {}
 *   this.tenantPrisma.client.patient.findMany(...)
 *
 * Nota sobre findUnique: NO se inyecta tenantId porque rompe las restricciones
 * de unicidad de Prisma. Los services deben usar findFirst({ where: { id, tenantId } })
 * o dejar que el auto-inject filtre a través de findFirst/findMany.
 */
@Injectable()
export class TenantPrismaService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _client!: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  onModuleInit() {
    const clsRef = this.cls;

    this._client = this.prisma.$extends({
      query: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $allModels: {
          async $allOperations({
            model,
            operation,
            args,
            query,
          }: {
            model: string;
            operation: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query: (args: any) => Promise<any>;
          }) {
            // Solo inyectar en modelos de negocio con tenant_id
            if (!TENANT_SCOPED_MODELS.has(model)) {
              return query(args);
            }

            const tenantId = clsRef.get<string | undefined>(TENANT_ID_KEY);

            // Sin tenant en contexto → pasar sin filtro (rutas públicas / scripts)
            if (!tenantId) {
              return query(args);
            }

            // ── Operaciones de lectura ──────────────────────────────────────
            if (
              operation === 'findMany' ||
              operation === 'findFirst' ||
              operation === 'findFirstOrThrow' ||
              operation === 'count' ||
              operation === 'aggregate' ||
              operation === 'groupBy'
            ) {
              args = { ...args, where: { ...args.where, tenantId } };
            }

            // ── Creación ───────────────────────────────────────────────────
            else if (operation === 'create') {
              args = { ...args, data: { ...args.data, tenantId } };
            } else if (operation === 'createMany') {
              const data = Array.isArray(args.data)
                ? args.data.map((d: Record<string, unknown>) => ({
                    ...d,
                    tenantId,
                  }))
                : { ...args.data, tenantId };
              args = { ...args, data };
            }

            // ── Actualización / eliminación ────────────────────────────────
            else if (
              operation === 'update' ||
              operation === 'updateMany' ||
              operation === 'delete' ||
              operation === 'deleteMany'
            ) {
              args = { ...args, where: { ...args.where, tenantId } };
            }

            // ── Upsert ─────────────────────────────────────────────────────
            else if (operation === 'upsert') {
              args = {
                ...args,
                where: { ...args.where, tenantId },
                create: { ...args.create, tenantId },
                // update: no tocar — ya existe el registro
              };
            }

            // findUnique / findUniqueOrThrow → sin inyección
            // (rompe restricciones de unicidad de Prisma; usar findFirst en su lugar)

            return query(args);
          },
        },
      },
    });
  }

  /**
   * Devuelve el cliente Prisma con tenant-scoping automático.
   * Tipado como PrismaService para mantener autocompleción en services.
   */
  get client(): PrismaService {
    return this._client as PrismaService;
  }
}
