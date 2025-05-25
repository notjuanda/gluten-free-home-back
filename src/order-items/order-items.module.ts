import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrderItem } from './entities/order-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([OrderItem])],  
    controllers: [OrderItemsController],
    providers: [OrderItemsService],
    exports: [TypeOrmModule],
})
export class OrderItemsModule {}
