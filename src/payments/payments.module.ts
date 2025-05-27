import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Order])],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [TypeOrmModule],
})
export class PaymentsModule {}
