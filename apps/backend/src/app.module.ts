import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantClsMiddleware } from './tenant/tenant-cls.middleware';
import { SubscriptionGuard } from './tenant/subscription.guard';
import { AuthModule } from './auth/auth.module';
import { PlatformAuthModule } from './platform-auth/platform-auth.module';
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
import { PlatformModule } from './platform/platform.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    // ── Variables de entorno (.env) ───────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),
    // ── CLS (continuation-local storage) — base para tenant context ───────
    ClsModule.forRoot({ global: true, middleware: { mount: false } }),
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
    // ── Módulos de infraestructura ────────────────────────────────────────
    PrismaModule,
    TenantModule,  // @Global — provee TenantPrismaService, TenantGuard
    // ── Módulos de negocio ────────────────────────────────────────────────
    AuthModule,
    PlatformAuthModule,
    PlatformModule,
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
    SubscriptionsModule,
  ],
  providers: [
    // ThrottlerGuard aplicado globalmente a TODAS las rutas
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // SubscriptionGuard: verifica que el tenant tenga suscripción activa.
    // Solo actúa cuando hay tenantId en CLS (rutas tenant); las rutas public
    // y platform no tienen tenantId → pasan sin verificación.
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // TenantClsMiddleware extrae tenantId del JWT y lo guarda en CLS + request.
    // Se aplica a todas las rutas; si no hay JWT simplemente no hace nada.
    consumer.apply(TenantClsMiddleware).forRoutes('*');
  }
}
