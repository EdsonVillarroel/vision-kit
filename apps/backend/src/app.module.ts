import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { ClinicalExamsModule } from './clinical-exams/clinical-exams.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    ClinicalExamsModule,
    InventoryModule,
    SalesModule,
    SettingsModule,
  ],
})
export class AppModule {}
