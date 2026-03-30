import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { UploadModule } from './upload/upload.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    // ── Variables de entorno (.env) ───────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),
    // ── Rate limiting global ───────────────────────────────────────────────
    // Tres ventanas apiladas: burst / por minuto / por hora
    ThrottlerModule.forRoot([
      {
        name: 'short',       // burst protection: máx 10 req/seg por IP
        ttl: 1_000,
        limit: 10,
      },
      {
        name: 'medium',      // general: máx 100 req/min por IP
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'long',        // anti-scraping: máx 1 000 req/hora por IP
        ttl: 3_600_000,
        limit: 1_000,
      },
    ]),
    // ── Módulos de negocio ────────────────────────────────────────────────
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
    UploadModule,
    PublicModule,
  ],
  providers: [
    // ThrottlerGuard aplicado globalmente a TODAS las rutas
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
