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
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private service: MedicalRecordsService) {}

  // GET /api/v1/medical-records?patientId=
  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.service.findAll(patientId);
  }

  // GET /api/v1/medical-records/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /api/v1/medical-records
  @Post()
  create(@Body() dto: CreateMedicalRecordDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  // PATCH /api/v1/medical-records/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMedicalRecordDto>) {
    return this.service.update(id, dto);
  }

  // DELETE /api/v1/medical-records/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
