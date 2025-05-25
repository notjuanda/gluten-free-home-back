import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Address, OrderItem, Payment])],  
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [TypeOrmModule],
})
export class OrdersModule {}
