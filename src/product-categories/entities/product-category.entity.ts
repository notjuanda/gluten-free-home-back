import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'product_categories' })
export class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ unique: true })
    slug: string;

    @CreateDateColumn()
    creadoEn: Date;

    @OneToMany(() => Product, (product) => product.categoria)
    products: Product[];
}
