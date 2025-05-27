import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogCategoriesController } from './blog-categories.controller';
import { BlogCategory } from './entities/blog-categorie.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BlogCategory])],
    providers: [BlogCategoriesService],
    controllers: [BlogCategoriesController],
    exports: [TypeOrmModule],
})
export class BlogCategoriesModule {}
