import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  // GET /api/v1/settings
  @Get()
  get() {
    return this.service.get();
  }

  // PATCH /api/v1/settings
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }
}
