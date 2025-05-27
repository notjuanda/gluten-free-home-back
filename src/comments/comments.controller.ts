import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get()
    @Permissions('comentarios:ver')
    findAll() {
        return this.commentsService.findAll();
    }

    @Get('by-article/:id')
    @Permissions('comentarios:ver_por_articulo')
    findByArticle(@Param('id', ParseIntPipe) id: number) {
        return this.commentsService.findByArticle(id);
    }

    @Get('by-user/:id')
    @Permissions('comentarios:ver_por_usuario')
    findByUser(@Param('id', ParseIntPipe) id: number) {
        return this.commentsService.findByUser(id);
    }

    @Post()
    @Permissions('comentarios:crear')
    create(@Body() dto: CreateCommentDto) {
        return this.commentsService.create(dto);
    }

    @Patch(':id/moderate')
    @Permissions('comentarios:moderar')
    moderate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ModerateCommentDto,
    ) {
        return this.commentsService.moderate(id, dto);
    }
}
