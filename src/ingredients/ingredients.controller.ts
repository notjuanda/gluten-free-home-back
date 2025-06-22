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

@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly service: IngredientsService) {}

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
    @Permissions('ingredientes:crear')
    create(@Body() dto: CreateIngredientDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('ingredientes:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateIngredientDto,
    ) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('ingredientes:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }

    @Get(':id/productos')
    getProductosUsan(@Param('id', ParseIntPipe) id: number) {
        return this.service.getProductosUsan(id);
    }
}
