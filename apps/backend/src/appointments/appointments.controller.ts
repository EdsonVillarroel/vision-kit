import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('appointments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @ApiOperation({ summary: 'Listar citas con filtros opcionales' })
  @ApiQuery({ name: 'date', required: false, example: '2026-03-28' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'practitionerId', required: false })
  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('practitionerId') practitionerId?: string,
  ) {
    return this.appointmentsService.findAll(date, status, practitionerId);
  }

  @ApiOperation({ summary: 'Slots disponibles para una fecha y practicante' })
  @ApiQuery({ name: 'date', required: true, example: '2026-03-28' })
  @ApiQuery({ name: 'practitionerId', required: true })
  @Get('slots')
  getSlots(
    @Query('date') date: string,
    @Query('practitionerId') practitionerId: string,
  ) {
    return this.appointmentsService.getAvailableSlots(date, practitionerId);
  }

  @ApiOperation({ summary: 'Obtener cita por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear cita' })
  @Post()
  create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Actualizar estado de cita' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar cita — roles: admin, manager' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
