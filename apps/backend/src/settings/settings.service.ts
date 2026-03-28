import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.clinicSettings.findFirst();
    if (!settings) {
      return this.prisma.clinicSettings.create({
        data: { name: 'Mi Óptica' },
      });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();
    return this.prisma.clinicSettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}
