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
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AsignarCategoriaDto } from './dto/asignar-categoria.dto';
import { AsignarMarcaDto } from './dto/asignar-marca.dto';
import { AsignarIngredientesDto } from './dto/asignar-ingredientes.dto';
import { SubirImagenDto } from './dto/subir-imagen.dto';

import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post()
    @Permissions('productos:crear')
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    @Permissions('productos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    @Permissions('productos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/categoria')
    @Permissions('productos:asignar_categoria')
    asignarCategoria(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarCategoriaDto,
    ) {
        return this.productsService.asignarCategoria(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/marca')
    @Permissions('productos:asignar_marca')
    asignarMarca(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarMarcaDto,
    ) {
        return this.productsService.asignarMarca(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id/ingredientes')
    @Permissions('productos:asignar_ingredientes')
    asignarIngredientes(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarIngredientesDto,
    ) {
        return this.productsService.asignarIngredientes(id, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post(':id/imagenes')
    @Permissions('productos:subir_imagenes')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    subirImagen(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: SubirImagenDto,
    ) {
        return this.productsService.subirImagen(id, file, dto);
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id/imagenes/:imagenId')
    @Permissions('productos:eliminar_imagenes')
    eliminarImagen(
        @Param('id', ParseIntPipe) id: number,
        @Param('imagenId', ParseIntPipe) imagenId: number,
    ) {
        return this.productsService.eliminarImagen(id, imagenId);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get('top')
    getTopVendidos(@Query('limit') limit?: number) {
        return this.productsService.findTopVendidos(limit ? Number(limit) : 10);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Get(':id/ingredientes')
    getIngredientes(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getIngredientes(id);
    }

    @Get(':id/imagenes')
    getImagenes(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getImagenes(id);
    }
}
