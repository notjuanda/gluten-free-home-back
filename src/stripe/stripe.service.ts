import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
    constructor(
        @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
        private readonly configService: ConfigService,
    ) {}

    async constructWebhookEvent(payload: Buffer, signature: string) {
        const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET no está configurada');
        }

        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (error) {
            throw new BadRequestException(`Error al verificar el webhook: ${error.message}`);
        }
    }

    async createCheckoutSession(
        lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
        mode: 'payment' | 'subscription' = 'payment',
        successUrl: string,
        cancelUrl: string,
        metadata?: any,
    ) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata,
            });
            return session;
        } catch (error) {
            throw new BadRequestException(`Error al crear la sesión de checkout: ${error.message}`);
        }
    }
}