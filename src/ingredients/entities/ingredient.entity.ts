import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'ingredients' })
export class Ingredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @ManyToMany(() => Product, (p) => p.ingredientes)
    products: Product[];
}
