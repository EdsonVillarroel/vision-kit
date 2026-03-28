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
import { ClinicalExamsService } from './clinical-exams.service';
import { CreateClinicalExamDto } from './dto/create-clinical-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('clinical-exams')
export class ClinicalExamsController {
  constructor(private service: ClinicalExamsService) {}

  // GET /api/v1/clinical-exams?patientId=
  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.service.findAll(patientId);
  }

  // GET /api/v1/clinical-exams/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /api/v1/clinical-exams
  @Post()
  create(@Body() dto: CreateClinicalExamDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  // PATCH /api/v1/clinical-exams/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateClinicalExamDto>) {
    return this.service.update(id, dto);
  }

  // DELETE /api/v1/clinical-exams/:id
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
