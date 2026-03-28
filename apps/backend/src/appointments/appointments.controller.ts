import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  // GET /api/v1/appointments?date=&status=&practitionerId=
  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('practitionerId') practitionerId?: string,
  ) {
    return this.appointmentsService.findAll(date, status, practitionerId);
  }

  // GET /api/v1/appointments/slots?date=&practitionerId=
  @Get('slots')
  getSlots(
    @Query('date') date: string,
    @Query('practitionerId') practitionerId: string,
  ) {
    return this.appointmentsService.getAvailableSlots(date, practitionerId);
  }

  // GET /api/v1/appointments/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // POST /api/v1/appointments
  @Post()
  create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(dto, req.user.id);
  }

  // PATCH /api/v1/appointments/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  // DELETE /api/v1/appointments/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
