import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity({ name: 'payments' })
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (o) => o.pagos, { onDelete: 'CASCADE' })
    pedido: Order;

    @Column()
    metodo: string;

    @Column('decimal', { precision: 12, scale: 2 })
    montoBob: number;

    @Column('decimal', { precision: 12, scale: 2, nullable: true })
    montoUsd?: number;

    @Column({ type: 'timestamp' })
    fechaPago: Date;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDIENTE,
    })
    estado: PaymentStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
