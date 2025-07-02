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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AsignarDireccionDto } from './dto/asignar-direccion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me/orders')
    async findMyOrders(@Req() req) {
        const userId = req.user.sub;
        return this.ordersService.findByUserId(userId);
    }

    @Get(':id')
    @Permissions('pedidos:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOne(id);
    }

    @Post()
    @Permissions('pedidos:crear')
    create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }

    @Patch(':id')
    @Permissions('pedidos:editar')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
        return this.ordersService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('pedidos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.remove(id);
    }

    @Get(':id/items')
    @Permissions('pedidos:ver_items')
    getItems(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.getItems(id);
    }

    @Patch(':id/direccion-envio')
    @Permissions('pedidos:asignar_direccion_envio')
    asignarDireccion(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarDireccionDto,
    ) {
        return this.ordersService.asignarDireccion(id, dto);
    }

    @Get(':id/direccion-envio')
    @Permissions('pedidos:ver_direccion_envio')
    getDireccion(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.getDireccion(id);
    }

    @Get()
    @Permissions('pedidos:ver')
    findAll() {
        return this.ordersService.findAll();
    }
}
