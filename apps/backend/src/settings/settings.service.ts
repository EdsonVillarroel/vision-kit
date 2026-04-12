import { Injectable } from '@nestjs/common';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  async get() {
    const settings = await this.tenantPrisma.client.clinicSettings.findFirst();
    if (!settings) {
      return this.tenantPrisma.client.clinicSettings.create({
        data: { name: 'Mi Óptica' },
      });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();
    return this.tenantPrisma.client.clinicSettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}
