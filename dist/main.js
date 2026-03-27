"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Display Tester API')
        .setDescription('API for detecting display capabilities and running dead-pixel tests')
        .setVersion('1.0')
        .addTag('display', 'Display detection endpoints')
        .addTag('pixel-test', 'Dead pixel test endpoints')
        .addTag('reports', 'Test reports endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Display Tester running on http://localhost:${port}`);
    console.log(`Swagger docs:      http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map