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
import { BlogCategoriesService } from './blog-categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Controller('blog-categories')
export class BlogCategoriesController {
    constructor(private readonly service: BlogCategoriesService) {}

    // PÚBLICOS
    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    // PROTEGIDOS
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post()
    @Permissions('blog_categorias:crear')
    create(@Body() dto: CreateBlogCategoryDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('blog_categorias:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBlogCategoryDto,
    ) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('blog_categorias:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
