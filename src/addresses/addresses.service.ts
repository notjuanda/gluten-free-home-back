import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
    constructor(
        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    findAll() {
        return this.addressRepo.find({ relations: ['usuario'] });
    }

    async findOne(id: number) {
        const dir = await this.addressRepo.findOne({
            where: { id },
            relations: ['usuario'],
        });
        if (!dir) throw new NotFoundException('Dirección no encontrada');
        return dir;
    }

    async create(dto: CreateAddressDto) {
        const user = await this.userRepo.findOneBy({ id: dto.usuarioId });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const dir = this.addressRepo.create({
            ...dto,
            usuario: user,
        });

        return this.addressRepo.save(dir);
    }

    async update(id: number, dto: UpdateAddressDto) {
        const dir = await this.addressRepo.findOneBy({ id });
        if (!dir) throw new NotFoundException('Dirección no encontrada');
        Object.assign(dir, dto);
        return this.addressRepo.save(dir);
    }

    async remove(id: number) {
        const dir = await this.addressRepo.findOneBy({ id });
        if (!dir) throw new NotFoundException('Dirección no encontrada');
        return this.addressRepo.remove(dir);
    }

    async findByUsuario(usuarioId: number) {
        return this.addressRepo.find({ where: { usuario: { id: usuarioId } } });
    }
}
