import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('product-categories')
export class ProductCategoriesController {
    constructor(private readonly service: ProductCategoriesService) {}

    @Get()
    @Permissions('categorias:ver')
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @Permissions('categorias:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    @Permissions('categorias:crear')
    create(@Body() dto: CreateProductCategoryDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @Permissions('categorias:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductCategoryDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Permissions('categorias:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
