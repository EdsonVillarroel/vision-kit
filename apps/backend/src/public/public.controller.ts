import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  // ── Catálogo ──────────────────────────────────────────────────────────────

  @Get('catalog')
  @ApiOperation({ summary: 'Catálogo público de productos disponibles' })
  @ApiQuery({ name: 'category', required: false, description: 'frames | lenses | sunglasses | contact-lenses | accessories | solutions' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, marca o SKU' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Máximo 50' })
  @ApiResponse({ status: 200, description: 'Lista paginada de productos en stock' })
  getCatalog(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getCatalog(
      category,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('catalog/:id')
  @ApiOperation({ summary: 'Detalle de un producto' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado o no disponible' })
  getProduct(@Param('id') id: string) {
    return this.service.getProductById(id);
  }

  // ── Clínica ───────────────────────────────────────────────────────────────

  @Get('clinic')
  @ApiOperation({ summary: 'Información pública de la clínica (nombre, dirección, horarios)' })
  @ApiResponse({ status: 200, description: 'Info de la clínica' })
  getClinicInfo() {
    return this.service.getClinicInfo();
  }

  // ── Reservas ──────────────────────────────────────────────────────────────

  @Post('bookings')
  @HttpCode(201)
  // Límite estricto en el POST de reservas: 3/min y máx 2 rápidos seguidos
  @Throttle({ short: { limit: 2, ttl: 10_000 }, medium: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Solicitar reserva de cita online' })
  @ApiResponse({ status: 201, description: 'Reserva creada — pendiente de confirmación por el staff' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o fecha pasada' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes — espera antes de reintentar' })
  createBooking(@Body() dto: CreateBookingDto) {
    return this.service.createBooking(dto);
  }
}
