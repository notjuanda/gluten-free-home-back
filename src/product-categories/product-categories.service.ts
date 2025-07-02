import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
    constructor(
        @InjectRepository(ProductCategory)
        private readonly repo: Repository<ProductCategory>,
    ) {}

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        const cat = await this.repo.findOneBy({ id });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return cat;
    }

    async create(dto: CreateProductCategoryDto) {
        const cat = this.repo.create(dto);
        return this.repo.save(cat);
    }

    async update(id: number, dto: UpdateProductCategoryDto) {
        const cat = await this.repo.findOneBy({ id });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        Object.assign(cat, dto);
        return this.repo.save(cat);
    }

    async remove(id: number) {
        const cat = await this.repo.findOneBy({ id });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return this.repo.remove(cat);
    }
}
