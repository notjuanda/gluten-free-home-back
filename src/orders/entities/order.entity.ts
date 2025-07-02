import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Payment } from '../../payments/entities/payment.entity';

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (u) => u.pedidos, { nullable: false })
    usuario: User;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDIENTE })
    estado: OrderStatus;

    @Column('decimal', { precision: 12, scale: 2 })
    totalBob: number;

    @Column('decimal', { precision: 12, scale: 2, nullable: true })
    totalUsd?: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        default: 0,
        comment: 'Costo de envío en Bolivianos',
    })
    costoEnvioBob: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        nullable: true,
        comment: 'Costo de envío en Dólares',
    })
    costoEnvioUsd?: number;

    @ManyToOne(() => Address, { nullable: false, onDelete: 'SET NULL' })
    direccionEnvio: Address;

    @OneToMany(() => OrderItem, (item) => item.pedido, { cascade: true })
    items: OrderItem[];

    @OneToMany(() => Payment, (p) => p.pedido)
    pagos: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
