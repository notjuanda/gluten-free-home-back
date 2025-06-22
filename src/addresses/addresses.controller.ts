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
    Req,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Request } from 'express';

@Controller('addresses')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    findMyAddresses(@Req() req: Request) {
        const userId = req.user['sub'];
        return this.addressesService.findByUserId(userId);
    }

    @Get()
    @Permissions('direcciones:ver')
    findAll() {
        return this.addressesService.findAll();
    }

    @Get(':id')
    @Permissions('direcciones:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.addressesService.findOne(id);
    }

    @Post()
    @Permissions('direcciones:crear')
    create(@Body() dto: CreateAddressDto) {
        return this.addressesService.create(dto);
    }

    @Patch(':id')
    @Permissions('direcciones:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressesService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('direcciones:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.addressesService.remove(id);
    }

    @Get('usuario/:usuarioId')
    @Permissions('direcciones:ver_por_usuario')
    findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
        return this.addressesService.findByUsuario(usuarioId);
    }
}
