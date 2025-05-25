import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    OneToMany,
    JoinTable,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Article } from '../../articles/entities/article.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Order } from '../../orders/entities/order.entity';
import { EmailStatus } from '../../common/enums/email-status.enum';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 80 })
    nombreUsuario: string;

    @Column({ unique: true, length: 150 })
    correo: string;

    @Column({
        type: 'enum',
        enum: EmailStatus,
        default: EmailStatus.NO_VERIFICADO,
    })
    estadoCorreo: EmailStatus;

    @Column()
    contraseñaHash: string;

    @Column({ length: 150, nullable: true })
    nombreCompleto?: string;

    @Column({ length: 50, nullable: true })
    telefono?: string;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    /* ───── Relaciones ───── */
    @ManyToMany(() => Role, (role) => role.usuarios, { eager: true })
    @JoinTable({ name: 'user_roles' })
    roles: Role[];

    @OneToMany(() => Address, (addr) => addr.usuario)
    direcciones: Address[];

    @OneToMany(() => Order, (order) => order.usuario)
    pedidos: Order[];

    @OneToMany(() => Article, (art) => art.autor)
    articulos: Article[];

    @OneToMany(() => Comment, (com) => com.usuario)
    comentarios: Comment[];
}
