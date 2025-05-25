import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    urlImagen: string;

    @Column({ nullable: true })
    textoAlt?: string;

    @ManyToOne(() => Product, (p) => p.imagenes, { onDelete: 'CASCADE' })
    producto: Product;
}
