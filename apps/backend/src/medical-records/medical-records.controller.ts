import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('medical-records')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private service: MedicalRecordsService) {}

  @ApiOperation({ summary: 'Listar historiales clínicos' })
  @ApiQuery({ name: 'patientId', required: false })
  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.service.findAll(patientId);
  }

  @ApiOperation({ summary: 'Obtener historial clínico por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Crear historial clínico' })
  @Post()
  create(@Body() dto: CreateMedicalRecordDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Actualizar historial clínico' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMedicalRecordDto>) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar historial — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
