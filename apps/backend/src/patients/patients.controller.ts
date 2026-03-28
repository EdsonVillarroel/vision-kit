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
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  // GET /api/v1/patients?search=xxx
  @Get()
  findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  // GET /api/v1/patients/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  // POST /api/v1/patients
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  // PATCH /api/v1/patients/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  // DELETE /api/v1/patients/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  // GET /api/v1/patients/:id/medical-records
  @Get(':id/medical-records')
  getMedicalHistory(@Param('id') id: string) {
    return this.patientsService.getMedicalHistory(id);
  }

  // GET /api/v1/patients/:id/sales
  @Get(':id/sales')
  getSales(@Param('id') id: string) {
    return this.patientsService.getSales(id);
  }
}
