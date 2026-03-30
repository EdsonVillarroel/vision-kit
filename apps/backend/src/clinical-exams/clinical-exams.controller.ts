import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClinicalExamsService } from './clinical-exams.service';
import { CreateClinicalExamDto } from './dto/create-clinical-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('clinical-exams')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('clinical-exams')
export class ClinicalExamsController {
  constructor(private service: ClinicalExamsService) {}

  @ApiOperation({ summary: 'Listar exámenes clínicos' })
  @ApiQuery({ name: 'patientId', required: false })
  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.service.findAll(patientId);
  }

  @ApiOperation({ summary: 'Obtener examen clínico por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Crear examen clínico' })
  @Post()
  create(@Body() dto: CreateClinicalExamDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Actualizar examen clínico' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateClinicalExamDto>) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar examen clínico — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
