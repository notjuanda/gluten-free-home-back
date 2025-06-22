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

@Controller('product-categories')
export class ProductCategoriesController {
    constructor(private readonly service: ProductCategoriesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post()
    @Permissions('categorias:crear')
    create(@Body() dto: CreateProductCategoryDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('categorias:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductCategoryDto,
    ) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('categorias:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
