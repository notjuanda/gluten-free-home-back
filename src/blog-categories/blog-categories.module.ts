import { Module } from '@nestjs/common';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogCategoriesController } from './blog-categories.controller';
import { BlogCategory } from './entities/blog-categorie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([BlogCategory])],
    controllers: [BlogCategoriesController],
    providers: [BlogCategoriesService],
    exports: [TypeOrmModule],
})
export class BlogCategoriesModule {}
