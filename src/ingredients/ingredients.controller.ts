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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly service: IngredientsService) {}

    @Get()
    @Permissions('ingredientes:ver')
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @Permissions('ingredientes:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Post()
    @Permissions('ingredientes:crear')
    create(@Body() dto: CreateIngredientDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @Permissions('ingredientes:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateIngredientDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Permissions('ingredientes:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }

    @Get(':id/productos')
    @Permissions('ingredientes:ver_productos_usan')
    getProductosUsan(@Param('id', ParseIntPipe) id: number) {
        return this.service.getProductosUsan(id);
    }
}
