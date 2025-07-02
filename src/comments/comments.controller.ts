import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    // PÚBLICOS
    @Get()
    findAll() {
        return this.commentsService.findAll();
    }

    @Get('by-article/:id')
    findByArticle(@Param('id', ParseIntPipe) id: number) {
        return this.commentsService.findByArticle(id);
    }

    @Get('by-user/:id')
    findByUser(@Param('id', ParseIntPipe) id: number) {
        return this.commentsService.findByUser(id);
    }

    // SOLO AUTENTICADO
    @UseGuards(JwtAuthGuard)
    @Post()
    @Permissions('comentarios:crear')
    create(@Body() dto: CreateCommentDto, @Req() req: Request) {
        // Asociar el usuario autenticado aquí
        // @ts-ignore
        const userId = req.user?.id;
        return this.commentsService.create(dto, userId);
    }

    // SOLO ADMIN/MODERADOR
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/moderate')
    @Permissions('comentarios:moderar')
    moderate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ModerateCommentDto,
    ) {
        return this.commentsService.moderate(id, dto);
    }
}
