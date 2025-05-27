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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';
import { AssignCategoriesDto } from './dto/assign-categories.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Get()
    @Permissions('articulos:ver')
    findAll() {
        return this.articlesService.findAll();
    }

    @Get(':id')
    @Permissions('articulos:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.findOne(id);
    }

    @Post()
    @Permissions('articulos:crear')
    create(@Body() dto: CreateArticleDto) {
        return this.articlesService.create(dto);
    }

    @Patch(':id')
    @Permissions('articulos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateArticleDto,
    ) {
        return this.articlesService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('articulos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.remove(id);
    }

    @Patch(':id/tags')
    @Permissions('articulos:asignar_tags')
    assignTags(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTagsDto,
    ) {
        return this.articlesService.assignTags(id, dto.tagIds);
    }

    @Patch(':id/categorias')
    @Permissions('articulos:asignar_categorias')
    assignCategories(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignCategoriesDto,
    ) {
        return this.articlesService.assignCategories(id, dto.categoryIds);
    }

    @Get(':id/tags')
    @Permissions('articulos:ver_tags_asignados')
    getTags(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getTags(id);
    }

    @Get(':id/categorias')
    @Permissions('articulos:ver_categorias_asignadas')
    getCategories(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getCategories(id);
    }
}
