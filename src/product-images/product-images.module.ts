import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImage } from './entities/product-image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([ProductImage])],
    controllers: [ProductImagesController],
    providers: [ProductImagesService],
    exports: [TypeOrmModule],
})
export class ProductImagesModule {}
