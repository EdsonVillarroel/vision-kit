import * as Sentry from '@sentry/node';

// ── Sentry: init ANTES de NestFactory para capturar errores de bootstrap ──
// Solo se activa si SENTRY_DSN está definido (opt-in por entorno).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE,
    // 0.0–1.0 — en prod típicamente 0.1 para no saturar plan.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0'),
  });
}

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Reemplaza el logger por defecto de Nest con Pino (estructurado, redact)
  app.useLogger(app.get(PinoLogger));

  app.setGlobalPrefix('api/v1');

  // ── Helmet: cabeceras de seguridad HTTP ───────────────────────────────────
  app.use(
    helmet({
      // crossOriginResourcePolicy 'cross-origin' permite que las imágenes
      // alojadas en este servidor sean embebidas desde el dominio de vision-2020
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // CSP desactivado en dev para que Swagger UI funcione sin restricciones.
      // Activar en producción con una política ajustada al dominio real.
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }),
  );

  // ── ValidationPipe global ─────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── CORS: múltiples orígenes ──────────────────────────────────────────────
  // CORS_ORIGINS = lista separada por coma (nuevo, soporta vision-2020 + admin)
  // CORS_ORIGIN  = campo legacy (un solo origen), usado como fallback
  const rawOrigins =
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173';

  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin Origin: Postman, curl, apps móviles del equipo interno
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin '${origin}' no permitido por CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Swagger ───────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Vision Kit API')
    .setDescription('API REST para gestión de clínica óptica')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Autenticación y sesión')
    .addTag('users', 'Gestión de usuarios del sistema')
    .addTag('patients', 'Gestión de pacientes')
    .addTag('appointments', 'Agenda y citas')
    .addTag('medical-records', 'Historiales clínicos')
    .addTag('clinical-exams', 'Exámenes clínicos refractivos')
    .addTag('inventory', 'Inventario de productos')
    .addTag('sales', 'Punto de venta')
    .addTag('settings', 'Configuración de la clínica')
    .addTag('upload', 'Subida de imágenes a Supabase Storage')
    .addTag('public', 'Portal público — catálogo y reservas online (sin auth)')
    .addTag('health', 'Healthcheck para load balancers / uptime monitors')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  // ─────────────────────────────────────────────────────────────────────────

  // Shutdown limpio: drena requests + flushea Sentry antes de salir
  app.enableShutdownHooks();

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Vision Kit API   → http://localhost:${port}/api/v1`);
  logger.log(`Swagger UI       → http://localhost:${port}/api/docs`);
  logger.log(`Public API       → http://localhost:${port}/api/v1/public/`);
  if (process.env.SENTRY_DSN) {
    logger.log(`Sentry           → enabled (env=${process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV})`);
  }
}

bootstrap().catch(async (err) => {
  // Captura cualquier fallo de bootstrap (env vars faltantes, etc.) y flushea
  // a Sentry antes de salir para no perder el evento.
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
  }
   
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
