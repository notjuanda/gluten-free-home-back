import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { StripeModule } from '../stripe/stripe.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment, Order]),
        StripeModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [TypeOrmModule],
})
export class PaymentsModule {}
