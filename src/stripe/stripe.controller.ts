import { Controller, Post, Req, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly ordersService: OrdersService,
    ) {}

    @Post('webhook')
    async handleWebhook(@Req() req: Request, @Res() res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        
        if (!sig) {
            throw new BadRequestException('Firma de Stripe no encontrada');
        }

        let event: any;
        try {
            console.log('--- Stripe Webhook: payload (Buffer) ---');
            console.log(req.body);
            event = await this.stripeService.constructWebhookEvent(req.body, sig);
            console.log('--- Stripe Webhook: evento construido ---');
            console.log(event);
        } catch (error) {
            console.error(`Error en la verificación del webhook de Stripe: ${error.message}`);
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
        }

        // Manejar el evento
        console.log('--- Stripe Webhook: event.type ---');
        console.log(event.type);
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout Session completada:', session.id);
                await this.ordersService.handleSuccessfulPayment(session);
                break;
            // case 'payment_intent.succeeded':
            //     const paymentIntent = event.data.object;
            //     console.log('Pago exitoso:', paymentIntent.id);
            //     break;
            default:
                console.log(`Evento no manejado:`, event.type);
        }

        res.status(HttpStatus.OK).json({ received: true });
    }
} 