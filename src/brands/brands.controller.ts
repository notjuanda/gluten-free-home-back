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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('brands')
export class BrandsController {
    constructor(private readonly service: BrandsService) {}

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
    @Permissions('marcas:crear')
    create(@Body() dto: CreateBrandDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('marcas:editar')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('marcas:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
