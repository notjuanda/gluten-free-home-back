import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Order } from '../orders/entities/order.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
    ) {}

    findAll() {
        return this.paymentRepo.find({ relations: ['pedido'] });
    }

    async findOne(id: number) {
        const pago = await this.paymentRepo.findOne({
            where: { id },
            relations: ['pedido'],
        });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        return pago;
    }

    async create(dto: CreatePaymentDto) {
        const pedido = await this.orderRepo.findOneBy({ id: dto.pedidoId });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');

        const pago = this.paymentRepo.create({
            ...dto,
            pedido,
        });

        return this.paymentRepo.save(pago);
    }

    async update(id: number, dto: UpdatePaymentDto) {
        const pago = await this.paymentRepo.findOneBy({ id });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        Object.assign(pago, dto);
        return this.paymentRepo.save(pago);
    }

    async remove(id: number) {
        const pago = await this.paymentRepo.findOneBy({ id });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        return this.paymentRepo.remove(pago);
    }

    async confirmar(id: number) {
        const pago = await this.paymentRepo.findOneBy({ id });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        pago.estado = PaymentStatus.CONFIRMADO;
        return this.paymentRepo.save(pago);
    }

    async createStripeCheckoutSession(dto: CreateCheckoutSessionDto) {
        const pedido = await this.orderRepo.findOne({
            where: { id: dto.pedidoId },
            relations: ['items', 'items.producto'], // Cargar items y productos relacionados
        });

        if (!pedido) {
            throw new NotFoundException('Pedido no encontrado');
        }

        if (!pedido.items || pedido.items.length === 0) {
            throw new BadRequestException('El pedido no tiene artículos');
        }

        const lineItems = pedido.items.map((item) => {
            const priceInUsd = item.precioUnitBob / 6.96; // Usar siempre el precio en BOB como base
            const priceInCents = Math.round(priceInUsd * 100);
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.producto.nombre,
                    },
                    unit_amount: priceInCents,
                },
                quantity: item.cantidad,
            };
        });

        // Añadir el costo de envío como un line_item adicional
        if (pedido.costoEnvioBob && pedido.costoEnvioBob > 0) {
            const shippingCostInUsd = pedido.costoEnvioBob / 6.96;
            const shippingCostInCents = Math.round(shippingCostInUsd * 100);
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Costo de Envío',
                    },
                    unit_amount: shippingCostInCents,
                },
                quantity: 1,
            });
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${frontendUrl}/payment/cancel`;

        const metadata = {
            orderId: pedido.id.toString(),
        };

        const session = await this.stripeService.createCheckoutSession(
            lineItems,
            'payment',
            successUrl,
            cancelUrl,
            metadata,
        );

        return { url: session.url };
    }
}
