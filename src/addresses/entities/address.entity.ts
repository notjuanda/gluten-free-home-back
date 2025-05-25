import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'addresses' })
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    linea1: string;

    @Column({ nullable: true })
    linea2?: string;

    @Column()
    ciudad: string;

    @Column()
    departamento: string;

    @Column({ nullable: true })
    codigoPostal?: string;

    @Column({ default: 'Bolivia' })
    pais: string;

    @CreateDateColumn()
    creadoEn: Date;

    @ManyToOne(() => User, (user) => user.direcciones, { onDelete: 'CASCADE' })
    usuario: User;
}
