import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository, In } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BlogCategory } from '../blog-categories/entities/blog-categorie.entity';
import { Tag } from '../tags/entities/tag.entities';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepo: Repository<Article>,
        @InjectRepository(BlogCategory)
        private readonly catRepo: Repository<BlogCategory>,
        @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    ) {}

    findAll() {
        return this.articleRepo.find({
            relations: ['autor', 'tags', 'categorias', 'comentarios'],
        });
    }

    async findOne(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['autor', 'tags', 'categorias', 'comentarios'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art;
    }

    async create(dto: CreateArticleDto) {
        const articulo = this.articleRepo.create(dto);

        if (dto.categoriasIds?.length) {
            articulo.categorias = await this.catRepo.findBy({
                id: In(dto.categoriasIds),
            });
        }

        if (dto.tagsIds?.length) {
            articulo.tags = await this.tagRepo.findBy({ id: In(dto.tagsIds) });
        }

        return this.articleRepo.save(articulo);
    }

    async update(id: number, dto: UpdateArticleDto) {
        const art = await this.articleRepo.findOneBy({ id });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        Object.assign(art, dto);
        return this.articleRepo.save(art);
    }

    async remove(id: number) {
        const art = await this.articleRepo.findOneBy({ id });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return this.articleRepo.remove(art);
    }

    async assignTags(id: number, tagIds: number[]) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        art.tags = await this.tagRepo.findBy({ id: In(tagIds) });
        return this.articleRepo.save(art);
    }

    async assignCategories(id: number, categoryIds: number[]) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        art.categorias = await this.catRepo.findBy({ id: In(categoryIds) });
        return this.articleRepo.save(art);
    }

    async getTags(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art.tags;
    }

    async getCategories(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art.categorias;
    }
}
