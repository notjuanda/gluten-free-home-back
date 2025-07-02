import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [
        ConfigModule,
        OrdersModule,
    ],
    controllers: [StripeController],
    providers: [
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                const secretKey = configService.get<string>('stripe.secretKey');
                if (!secretKey) {
                    throw new Error('STRIPE_SECRET_KEY no está configurada');
                }
                return new Stripe(secretKey, {
                    apiVersion: '2025-05-28.basil',
                });
            },
            inject: [ConfigService],
        },
        StripeService,
    ],
    exports: [StripeService],
})
export class StripeModule {} 