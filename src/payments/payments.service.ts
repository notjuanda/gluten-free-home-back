import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order } from '../orders/entities/order.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
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
}
