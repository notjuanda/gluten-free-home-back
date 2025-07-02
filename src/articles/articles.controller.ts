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
    UploadedFile,
    UseInterceptors,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';
import { AssignCategoriesDto } from './dto/assign-categories.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    // PÚBLICOS
    @Get()
    findAll() {
        return this.articlesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.findOne(id);
    }

    // PROTEGIDOS
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post()
    @Permissions('articulos:crear')
    create(@Body() dto: CreateArticleDto, @Req() req: Request) {
        const userId = req.user['id'] || req.user['sub'];
        return this.articlesService.create(dto, userId);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('articulos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateArticleDto,
    ) {
        return this.articlesService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('articulos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.remove(id);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/tags')
    @Permissions('articulos:asignar_tags')
    assignTags(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignTagsDto,
    ) {
        return this.articlesService.assignTags(id, dto.tagIds);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/categorias')
    @Permissions('articulos:asignar_categorias')
    assignCategories(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignCategoriesDto,
    ) {
        return this.articlesService.assignCategories(id, dto.categoryIds);
    }

    @Get(':id/tags')
    getTags(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getTags(id);
    }

    @Get(':id/categorias')
    getCategories(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getCategories(id);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/portada')
    @Permissions('articulos:editar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPortada(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('textoAlt') textoAlt?: string,
    ) {
        return this.articlesService.uploadPortada(id, file, textoAlt);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post('upload-block-image')
    @Permissions('articulos:editar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadBlockImage(
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.articlesService.uploadBlockImage(file);
    }
}
