import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformAuthGuard } from '../platform-auth/platform-auth.guard';
import { PlatformService } from './platform.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@ApiTags('platform')
@ApiBearerAuth('access-token')
@UseGuards(PlatformAuthGuard)
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  // ─── STATS ────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Estadísticas globales de la plataforma' })
  @ApiResponse({ status: 200, description: 'Totales de tenants, MRR, usuarios, pacientes' })
  @Get('stats')
  getStats() {
    return this.platformService.getStats();
  }

  @ApiOperation({ summary: 'Métricas de negocio: MRR, ARR, churn, activation rate, volumen' })
  @ApiResponse({ status: 200, description: 'Métricas agregadas para el dashboard del fundador' })
  @Get('metrics')
  getMetrics() {
    return this.platformService.getMetrics();
  }

  // ─── TENANTS ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Listar todos los tenants' })
  @ApiResponse({ status: 200, description: 'Lista de tenants con suscripción activa y conteos' })
  @Get('tenants')
  findAllTenants() {
    return this.platformService.findAllTenants();
  }

  @ApiOperation({ summary: 'Provisionar nuevo tenant (transacción: tenant + suscripción + super_admin)' })
  @ApiResponse({ status: 201, description: 'Tenant provisionado con super_admin creado' })
  @ApiResponse({ status: 409, description: 'Slug o email ya en uso' })
  @Post('tenants')
  provisionTenant(@Body() dto: CreateTenantDto) {
    return this.platformService.provisionTenant(dto);
  }

  @ApiOperation({ summary: 'Obtener detalle de un tenant' })
  @ApiResponse({ status: 200, description: 'Tenant con suscripciones y conteos' })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  @Get('tenants/:id')
  findTenantById(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformService.findTenantById(id);
  }

  @ApiOperation({ summary: 'Actualizar datos del tenant' })
  @ApiResponse({ status: 200, description: 'Tenant actualizado' })
  @Patch('tenants/:id')
  updateTenant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.platformService.updateTenant(id, dto);
  }

  @ApiOperation({ summary: 'Suspender tenant' })
  @ApiResponse({ status: 200, description: 'Tenant suspendido' })
  @Patch('tenants/:id/suspend')
  suspendTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformService.suspendTenant(id);
  }

  @ApiOperation({ summary: 'Activar tenant suspendido' })
  @ApiResponse({ status: 200, description: 'Tenant activado' })
  @Patch('tenants/:id/activate')
  activateTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformService.activateTenant(id);
  }

  // ─── PLANS ────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Listar todos los planes de suscripción' })
  @ApiResponse({ status: 200, description: 'Lista de planes con conteo de suscriptores' })
  @Get('plans')
  findAllPlans() {
    return this.platformService.findAllPlans();
  }

  @ApiOperation({ summary: 'Crear nuevo plan de suscripción' })
  @ApiResponse({ status: 201, description: 'Plan creado' })
  @ApiResponse({ status: 409, description: 'Slug ya existe' })
  @Post('plans')
  createPlan(@Body() dto: CreatePlanDto) {
    return this.platformService.createPlan(dto);
  }

  @ApiOperation({ summary: 'Actualizar plan de suscripción' })
  @ApiResponse({ status: 200, description: 'Plan actualizado' })
  @Patch('plans/:id')
  updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.platformService.updatePlan(id, dto);
  }

  // ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Listar todas las suscripciones' })
  @ApiResponse({ status: 200, description: 'Lista de suscripciones con tenant y plan' })
  @Get('subscriptions')
  findAllSubscriptions() {
    return this.platformService.findAllSubscriptions();
  }

  @ApiOperation({ summary: 'Actualizar suscripción (plan, estado, fechas, notas de pago)' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada' })
  @Patch('subscriptions/:id')
  updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.platformService.updateSubscription(id, dto);
  }
}
