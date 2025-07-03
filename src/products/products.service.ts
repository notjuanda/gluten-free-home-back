import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from './../product-categories/entities/product-category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductImage } from '../product-images/entities/product-image.entity';

import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly repo: Repository<Product>,
        @InjectRepository(ProductCategory)
        private readonly catRepo: Repository<ProductCategory>,
        @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
        @InjectRepository(Ingredient)
        private readonly ingRepo: Repository<Ingredient>,
        @InjectRepository(ProductImage)
        private readonly imgRepo: Repository<ProductImage>,
        private readonly uploadService: UploadService,
    ) {}

    findAll() {
        return this.repo.find({
            relations: ['categoria', 'marca', 'imagenes', 'ingredientes'],
        });
    }

    async findOne(id: number) {
        const prod = await this.repo.findOne({
            where: { id },
            relations: ['categoria', 'marca', 'imagenes', 'ingredientes'],
        });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        return prod;
    }

    async create(dto: CreateProductDto) {
        const prod = this.repo.create(dto);
        const categoria = await this.catRepo.findOneBy({ id: dto.categoriaId });
        if (!categoria) throw new NotFoundException('Categoría no encontrada');
        prod.categoria = categoria;

        if (dto.marcaId) {
            const marca = await this.brandRepo.findOneBy({ id: dto.marcaId });
            prod.marca = marca === null ? undefined : marca;
        }

        if (dto.ingredientesIds?.length) {
            prod.ingredientes = await this.ingRepo.findBy({
                id: In(dto.ingredientesIds),
            });
        }

        return this.repo.save(prod);
    }

    async update(id: number, dto: UpdateProductDto) {
        const prod = await this.repo.findOne({ where: { id } });
        if (!prod) throw new NotFoundException('Producto no encontrado');

        if (dto.categoriaId) {
            const categoria = await this.catRepo.findOneBy({
                id: dto.categoriaId,
            });
            if (!categoria)
                throw new NotFoundException('Categoría no encontrada');
            prod.categoria = categoria;
        }
        if (dto.marcaId) {
            const marca = await this.brandRepo.findOneBy({ id: dto.marcaId });
            prod.marca = marca === null ? undefined : marca;
        }

        Object.assign(prod, dto);
        return this.repo.save(prod);
    }

    async remove(id: number) {
        const prod = await this.repo.findOneBy({ id });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        return this.repo.remove(prod);
    }

    async asignarCategoria(id: number, dto: { categoriaId: number }) {
        const prod = await this.repo.findOneBy({ id });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        const categoria = await this.catRepo.findOneBy({ id: dto.categoriaId });
        if (!categoria) throw new NotFoundException('Categoría no encontrada');
        prod.categoria = categoria;
        return this.repo.save(prod);
    }

    async asignarMarca(id: number, dto: { marcaId: number }) {
        const prod = await this.repo.findOneBy({ id });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        const marca = await this.brandRepo.findOneBy({ id: dto.marcaId });
        prod.marca = marca === null ? undefined : marca;
        return this.repo.save(prod);
    }

    async asignarIngredientes(id: number, dto: { ingredientesIds: number[] }) {
        const prod = await this.repo.findOne({
            where: { id },
            relations: ['ingredientes'],
        });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        prod.ingredientes = await this.ingRepo.findBy({
            id: In(dto.ingredientesIds),
        });
        return this.repo.save(prod);
    }

    async getIngredientes(id: number) {
        const prod = await this.repo.findOne({
            where: { id },
            relations: ['ingredientes'],
        });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        return prod.ingredientes;
    }

    async getImagenes(id: number) {
        return this.imgRepo.find({ where: { producto: { id } } });
    }

    async subirImagen(
        id: number,
        file: Express.Multer.File,
        dto: { textoAlt?: string },
    ) {
        const prod = await this.repo.findOneBy({ id });
        if (!prod) throw new NotFoundException('Producto no encontrado');

        const filename = await this.uploadService.saveFile(file);
        const urlImagen = `/files/${filename}`;

        const img = this.imgRepo.create({
            urlImagen,
            textoAlt: dto.textoAlt,
            producto: prod,
        });
        return this.imgRepo.save(img);
    }

    async eliminarImagen(id: number, imagenId: number) {
        const img = await this.imgRepo.findOne({
            where: { id: imagenId, producto: { id } },
        });
        if (!img) throw new NotFoundException('Imagen no encontrada');
        return this.imgRepo.remove(img);
    }

    async findTopVendidos(limit = 10) {
        //  SUM(oi.cantidad) = total de unidades vendidas por producto
        const qb = this.repo
            .createQueryBuilder('p')
            .leftJoin('order_items', 'oi', 'oi.productoId = p.id')
            .leftJoinAndSelect('p.imagenes', 'imagenes')
            .leftJoinAndSelect('p.categoria', 'categoria')
            .leftJoinAndSelect('p.marca', 'marca')
            .select(['p', 'categoria', 'marca', 'imagenes'])
            .addSelect('COALESCE(SUM(oi.cantidad), 0)', 'ventas')
            .groupBy('p.id')
            .addGroupBy('categoria.id')
            .addGroupBy('marca.id')
            .addGroupBy('imagenes.id')
            .orderBy('ventas', 'DESC')
            .limit(limit);

        //  getRawMany() trae la columna calculada, getMany() trae las entidades;
        //  mezclamos ambas para incluir «ventas» en la respuesta.
        const [products, raw] = await Promise.all([
            qb.getMany(),
            qb.getRawMany<{ ventas: string }>(),
        ]);

        return products.map((prod, idx) => ({
            ...prod,
            ventas: Number(raw[idx].ventas),
        }));
    }

    async findBySlug(slug: string) {
        const prod = await this.repo.findOne({
            where: { slug },
            relations: ['categoria', 'marca', 'imagenes', 'ingredientes'],
        });
        if (!prod) throw new NotFoundException('Producto no encontrado');
        return prod;
    }
}
