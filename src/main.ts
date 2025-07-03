import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.use(cookieParser());

    // Body crudo SOLO para el webhook de Stripe
    app.use('/stripe/webhook', express.raw({ type: '*/*' }));
    // Body parser normal para el resto
    app.use(json({ limit: '50mb' }));

    // Servir archivos estáticos desde la carpeta uploads
    app.use('/files', express.static(path.join(process.cwd(), 'uploads')));

    app.enableCors({
        origin: process.env.FRONTEND_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
