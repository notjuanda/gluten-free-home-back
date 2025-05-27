import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly repo: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly itemRepo: Repository<OrderItem>,
        @InjectRepository(Address)
        private readonly addrRepo: Repository<Address>,
        @InjectRepository(Product)
        private readonly prodRepo: Repository<Product>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    findAll() {
        return this.repo.find({
            relations: ['usuario', 'direccionEnvio', 'items', 'items.producto'],
        });
    }

    async findOne(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['usuario', 'direccionEnvio', 'items', 'items.producto'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido;
    }

    async create(dto: CreateOrderDto) {
        const pedido = this.repo.create({
            totalBob: dto.totalBob,
            totalUsd: dto.totalUsd,
            items: [],
        });

        for (const i of dto.items) {
            const prod = await this.prodRepo.findOneBy({ id: i.productoId });
            if (!prod) throw new NotFoundException('Producto no encontrado');
            const item = this.itemRepo.create({
                cantidad: i.cantidad,
                precioUnitBob: prod.precioBob,
                precioUnitUsd: prod.precioUsd,
                producto: prod,
            });
            pedido.items.push(item);
        }

        return this.repo.save(pedido);
    }

    async update(id: number, dto: UpdateOrderDto) {
        const pedido = await this.repo.findOne({ where: { id } });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        Object.assign(pedido, dto);
        return this.repo.save(pedido);
    }

    async remove(id: number) {
        const pedido = await this.repo.findOneBy({ id });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return this.repo.remove(pedido);
    }

    async getItems(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['items', 'items.producto'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido.items;
    }

    async asignarDireccion(id: number, dto: { direccionId: number }) {
        const pedido = await this.repo.findOneBy({ id });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        const direccion = await this.addrRepo.findOneBy({
            id: dto.direccionId,
        });
        if (!direccion) throw new NotFoundException('Dirección no encontrada');
        pedido.direccionEnvio = direccion;
        return this.repo.save(pedido);
    }

    async getDireccion(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['direccionEnvio'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido.direccionEnvio;
    }
}
