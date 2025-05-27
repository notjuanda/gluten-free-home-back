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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AsignarCategoriaDto } from './dto/asignar-categoria.dto';
import { AsignarMarcaDto } from './dto/asignar-marca.dto';
import { AsignarIngredientesDto } from './dto/asignar-ingredientes.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { SubirImagenDto } from './dto/subir-imagen.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    @Permissions('productos:ver')
    findAll() {
        return this.productsService.findAll();
    }

    @Post()
    @Permissions('productos:crear')
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get(':id')
    @Permissions('productos:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @Permissions('productos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('productos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }

    @Patch(':id/categoria')
    @Permissions('productos:asignar_categoria')
    asignarCategoria(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarCategoriaDto,
    ) {
        return this.productsService.asignarCategoria(id, dto);
    }

    @Patch(':id/marca')
    @Permissions('productos:asignar_marca')
    asignarMarca(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarMarcaDto,
    ) {
        return this.productsService.asignarMarca(id, dto);
    }

    @Patch(':id/ingredientes')
    @Permissions('productos:asignar_ingredientes')
    asignarIngredientes(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarIngredientesDto,
    ) {
        return this.productsService.asignarIngredientes(id, dto);
    }

    @Get(':id/ingredientes')
    @Permissions('productos:ver_ingredientes')
    getIngredientes(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getIngredientes(id);
    }

    @Get(':id/imagenes')
    @Permissions('productos:ver_imagenes')
    getImagenes(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getImagenes(id);
    }

    @Post(':id/imagenes')
    @Permissions('productos:subir_imagenes')
    subirImagen(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: SubirImagenDto,
    ) {
        return this.productsService.subirImagen(id, body);
    }

    @Delete(':id/imagenes/:imagenId')
    @Permissions('productos:eliminar_imagenes')
    eliminarImagen(
        @Param('id', ParseIntPipe) id: number,
        @Param('imagenId', ParseIntPipe) imagenId: number,
    ) {
        return this.productsService.eliminarImagen(id, imagenId);
    }
}
