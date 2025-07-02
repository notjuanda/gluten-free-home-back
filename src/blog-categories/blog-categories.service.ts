import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategory } from './entities/blog-categorie.entity';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@Injectable()
export class BlogCategoriesService {
    constructor(
        @InjectRepository(BlogCategory)
        private readonly repo: Repository<BlogCategory>,
    ) {}

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        const cat = await this.repo.findOneBy({ id });
        if (!cat) throw new NotFoundException('Categoría no encontrada');
        return cat;
    }

    create(dto: CreateBlogCategoryDto) {
        const cat = this.repo.create(dto);
        return this.repo.save(cat);
    }

    async update(id: number, dto: UpdateBlogCategoryDto) {
        const cat = await this.findOne(id);
        Object.assign(cat, dto);
        return this.repo.save(cat);
    }

    async remove(id: number) {
        const cat = await this.findOne(id);
        return this.repo.remove(cat);
    }
}
