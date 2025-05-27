import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { BlogCategory } from '../blog-categories/entities/blog-categorie.entity';
import { Tag } from '../tags/entities/tag.entities';

@Module({
    imports: [TypeOrmModule.forFeature([Article, BlogCategory, Tag])],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [TypeOrmModule, ArticlesService],
})
export class ArticlesModule {}
