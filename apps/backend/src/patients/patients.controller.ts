import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlanQuotaGuard } from '../tenant/plan-quota.guard';
import { QuotaLimit } from '../tenant/quota-limit.decorator';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @ApiOperation({ summary: 'Listar / buscar pacientes' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nombre, ID, teléfono o email' })
  @Get()
  findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @ApiOperation({ summary: 'Obtener paciente por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear paciente — aplica cuota del plan' })
  @UseGuards(PlanQuotaGuard)
  @QuotaLimit('patients')
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar paciente' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar paciente — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  @ApiOperation({ summary: 'Historial clínico del paciente' })
  @Get(':id/medical-records')
  getMedicalHistory(@Param('id') id: string) {
    return this.patientsService.getMedicalHistory(id);
  }

  @ApiOperation({ summary: 'Ventas del paciente' })
  @Get(':id/sales')
  getSales(@Param('id') id: string) {
    return this.patientsService.getSales(id);
  }
}
