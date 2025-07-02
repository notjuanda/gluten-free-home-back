import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
    pedido: Order;

    @ManyToOne(() => Product)
    producto: Product;

    @Column({ type: 'int' })
    cantidad: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precioUnitBob: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    precioUnitUsd?: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
