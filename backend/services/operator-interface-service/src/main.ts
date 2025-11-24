import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { randomUUID } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware para generar X-Request-ID en cada request
  app.use((req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', requestId);
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  // Soporta múltiples orígenes separados por coma o función de validación
  // En desarrollo: http://localhost:3000, http://localhost:3005
  // En producción: https://apilogistica.mmalgor.com.ar o múltiples URLs separadas por coma
  const frontendUrls = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrls.split(',').map(url => url.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // En desarrollo, permitir localhost en cualquier puerto
      if (process.env.NODE_ENV === 'development') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }
      
      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.includes(origin) || allowedOrigins.some(url => origin === url)) {
        return callback(null, true);
      }
      
      // Log para debugging
      console.warn(`⚠️ CORS: Origin not allowed: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(null, true); // Permitir temporalmente para debugging - cambiar a false en producción estricta
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400, // 24 horas para preflight cache
  });

  // Obtener puerto antes de usarlo en Swagger
  const port = process.env.PORT || 3004;

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Operator Interface API Gateway')
    .setDescription(
      'API Gateway y Facade para operadores internos de logística. ' +
        'Proporciona acceso unificado a todos los microservicios del sistema mediante smart proxy routing. ' +
        'Incluye copias locales de endpoints de configuración y enrutamiento automático a servicios backend. ' +
        'Rutas disponibles: /config/*, /shipping/*, /stock/*, /gateway/status',
    )
    .setVersion('1.0.0')
    .setContact(
      'Grupo 12 - UTN FRRE',
      'https://github.com/grupos-12/logistica',
      'grupo12@logistics.com',
    )
    .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
    .addServer(`http://localhost:${port}`, 'Development Gateway')
    .addTag('config', '⚙️ Gestión de configuración (local)')
    .addTag('gateway', '🌐 Estado del Gateway y Service Registry')
    .addTag('health', '❤️ Health Checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Operator Interface API Gateway - Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });
  await app.listen(port);

  console.log(
    `🚀 Operator Interface Service running on http://localhost:${port}`,
  );
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
