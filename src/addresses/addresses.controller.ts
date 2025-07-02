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
    Logger,
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
    private readonly logger = new Logger(AddressesController.name);
    
    constructor(private readonly addressesService: AddressesService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async findMyAddresses(@Req() req: Request) {
        const userId = req.user['id'] || req.user['sub'];
        this.logger.log(`Buscando direcciones para usuario ID: ${userId}`);
        this.logger.log(`Usuario completo: ${JSON.stringify(req.user)}`);
        
        const addresses = await this.addressesService.findByUserId(userId);
        this.logger.log(`Direcciones encontradas: ${addresses.length}`);
        
        return addresses;
    }

    @Get('debug/all')
    @UseGuards(JwtAuthGuard)
    async debugAllAddresses(@Req() req: Request) {
        const userId = req.user['id'] || req.user['sub'];
        this.logger.log(`Debug: Usuario ID: ${userId}`);
        
        // Obtener todas las direcciones
        const allAddresses = await this.addressesService.findAll();
        this.logger.log(`Debug: Total de direcciones en BD: ${allAddresses.length}`);
        
        // Obtener direcciones del usuario específico
        const userAddresses = await this.addressesService.findByUserId(userId);
        this.logger.log(`Debug: Direcciones del usuario ${userId}: ${userAddresses.length}`);
        
        return {
            userId,
            totalAddresses: allAddresses.length,
            userAddresses: userAddresses.length,
            allAddresses: allAddresses.map(addr => ({
                id: addr.id,
                linea1: addr.linea1,
                usuarioId: addr.usuario?.id
            }))
        };
    }

    @Get('debug/db-check')
    async debugDatabaseCheck() {
        this.logger.log('Verificando estado de la base de datos...');
        
        const allAddresses = await this.addressesService.findAll();
        const addressesWithUsers = allAddresses.filter(addr => addr.usuario);
        const addressesWithoutUsers = allAddresses.filter(addr => !addr.usuario);
        
        this.logger.log(`Total direcciones: ${allAddresses.length}`);
        this.logger.log(`Direcciones con usuario: ${addressesWithUsers.length}`);
        this.logger.log(`Direcciones sin usuario: ${addressesWithoutUsers.length}`);
        
        return {
            totalAddresses: allAddresses.length,
            addressesWithUsers: addressesWithUsers.length,
            addressesWithoutUsers: addressesWithoutUsers.length,
            sampleAddresses: allAddresses.slice(0, 5).map(addr => ({
                id: addr.id,
                linea1: addr.linea1,
                usuarioId: addr.usuario?.id,
                usuarioNombre: addr.usuario?.nombreUsuario
            }))
        };
    }

    @Get('debug/stats')
    async getDatabaseStats() {
        return this.addressesService.getDatabaseStats();
    }

    @Post('debug/clean-orphans')
    async cleanOrphanAddresses() {
        return this.addressesService.cleanOrphanAddresses();
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
