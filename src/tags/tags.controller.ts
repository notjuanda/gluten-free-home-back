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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly service: TagsService) {}

    @Get()
    @Permissions('tags:ver')
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @Permissions('tags:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    @Permissions('tags:crear')
    create(@Body() dto: CreateTagDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @Permissions('tags:editar')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Permissions('tags:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
