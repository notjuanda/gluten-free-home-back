import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductImage } from '../product-images/entities/product-image.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            ProductCategory,
            Brand,
            Ingredient,
            ProductImage,
        ]),
        UploadModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
