import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';
import { ProductImage } from '../../product-images/entities/product-image.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    descripcion?: string;

    @ManyToOne(() => Brand, (b) => b.products, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    marca?: Brand;

    @ManyToOne(() => ProductCategory, (c) => c.products)
    categoria: ProductCategory;

    @Column('decimal', { precision: 10, scale: 2 })
    precioBob: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    precioUsd?: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ default: true })
    activo: boolean;

    @Column({ default: true })
    certificadoSinGluten: boolean;

    @Column({ nullable: true })
    urlCertificado?: string;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @OneToMany(() => ProductImage, (img) => img.producto, { cascade: true })
    imagenes: ProductImage[];

    @ManyToMany(() => Ingredient, (ing) => ing.products, { cascade: true })
    @JoinTable({ name: 'product_ingredients' })
    ingredientes: Ingredient[];
}
