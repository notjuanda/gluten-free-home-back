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

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('brands')
export class BrandsController {
    constructor(private readonly service: BrandsService) {}

    @Get()
    @Permissions('marcas:ver')
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @Permissions('marcas:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    @Permissions('marcas:crear')
    create(@Body() dto: CreateBrandDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @Permissions('marcas:editar')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Permissions('marcas:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
