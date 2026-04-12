import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  // ── Catálogo ──────────────────────────────────────────────────────────────

  async getCatalog(
    tenantSlug: string,
    category?: string,
    search?: string,
    page = 1,
    limit = 20,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Óptica no encontrada');
    if (tenant.status !== 'active') throw new NotFoundException('Óptica no disponible');

    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const where: Record<string, unknown> = {
      tenantId: tenant.id,
      status: 'in_stock',
    };

    if (category) where.category = category;

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { brand: { contains: search.trim(), mode: 'insensitive' } },
        { sku: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const select = {
      id: true,
      sku: true,
      name: true,
      brand: true,
      category: true,
      sellingPrice: true,
      images: true,
      specifications: {
        select: {
          frameType: true,
          material: true,
          color: true,
          lensSize: true,
          lensType: true,
        },
      },
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: safeLimit,
        select,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getProductById(tenantSlug: string, id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Óptica no encontrada');
    if (tenant.status !== 'active') throw new NotFoundException('Óptica no disponible');

    const product = await this.prisma.product.findFirst({
      where: { id, tenantId: tenant.id, status: 'in_stock' },
      select: {
        id: true,
        sku: true,
        name: true,
        brand: true,
        category: true,
        sellingPrice: true,
        images: true,
        specifications: {
          select: {
            frameType: true,
            material: true,
            color: true,
            lensSize: true,
            lensType: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  // ── Info clínica ──────────────────────────────────────────────────────────

  async getClinicInfo(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Óptica no encontrada');
    if (tenant.status !== 'active') throw new NotFoundException('Óptica no disponible');

    const settings = await this.prisma.clinicSettings.findFirst({
      where: { tenantId: tenant.id },
    });
    if (!settings) throw new NotFoundException('Información de la clínica no disponible');

    // Exponer solo campos seguros — sin id, taxRate, currency, rfc
    return {
      name: settings.name,
      address: settings.address,
      city: settings.city,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      logo: settings.logo,
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
      businessHours: settings.businessHours,
    };
  }

  // ── Reservas ──────────────────────────────────────────────────────────────

  async createBooking(tenantSlug: string, dto: CreateBookingDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new NotFoundException('Óptica no encontrada');
    if (tenant.status !== 'active') throw new NotFoundException('Óptica no disponible');

    // Validar que la fecha no sea pasada
    const requested = new Date(dto.preferredDate);
    requested.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requested < today) {
      throw new BadRequestException('La fecha de reserva debe ser futura');
    }

    const booking = await this.prisma.publicBooking.create({
      data: {
        tenantId: tenant.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        serviceType: dto.serviceType,
        preferredDate: new Date(dto.preferredDate),
        preferredTime: dto.preferredTime ?? null,
        notes: dto.notes ?? null,
      },
      select: {
        id: true,
        name: true,
        serviceType: true,
        preferredDate: true,
        preferredTime: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      ...booking,
      message: `Reserva recibida. Te contactaremos al ${dto.phone} para confirmar.`,
    };
  }
}
