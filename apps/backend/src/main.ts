import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Vision Kit API   → http://localhost:${port}/api/v1`);
  console.log(`Swagger UI       → http://localhost:${port}/api/docs`);
  console.log(`Public API       → http://localhost:${port}/api/v1/public/`);
}
bootstrap();
