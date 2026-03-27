import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Display Tester API')
    .setDescription('API for detecting display capabilities and running dead-pixel tests')
    .setVersion('1.0')
    .addTag('display', 'Display detection endpoints')
    .addTag('pixel-test', 'Dead pixel test endpoints')
    .addTag('reports', 'Test reports endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Display Tester running on http://localhost:${port}`);
  console.log(`Swagger docs:      http://localhost:${port}/api/docs`);
}

bootstrap();
