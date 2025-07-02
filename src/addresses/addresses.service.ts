import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
    private readonly logger = new Logger(AddressesService.name);

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

    async findByUserId(userId: number) {
        this.logger.log(`Buscando direcciones para usuario ID: ${userId}`);
        
        // Usar una consulta más explícita
        const addresses = await this.addressRepo
            .createQueryBuilder('address')
            .leftJoinAndSelect('address.usuario', 'usuario')
            .where('usuario.id = :userId', { userId })
            .getMany();
        
        this.logger.log(`Direcciones encontradas para usuario ${userId}: ${addresses.length}`);
        
        return addresses;
    }

    async findByUsuario(usuarioId: number) {
        this.logger.log(`Buscando direcciones para usuario ID: ${usuarioId}`);
        
        // Usar una consulta más explícita
        const addresses = await this.addressRepo
            .createQueryBuilder('address')
            .leftJoinAndSelect('address.usuario', 'usuario')
            .where('usuario.id = :usuarioId', { usuarioId })
            .getMany();
        
        this.logger.log(`Direcciones encontradas para usuario ${usuarioId}: ${addresses.length}`);
        
        return addresses;
    }

    async cleanOrphanAddresses() {
        this.logger.log('Limpiando direcciones huérfanas...');
        
        // Encontrar direcciones sin usuario
        const orphanAddresses = await this.addressRepo
            .createQueryBuilder('address')
            .leftJoin('address.usuario', 'usuario')
            .where('usuario.id IS NULL')
            .getMany();
        
        this.logger.log(`Direcciones huérfanas encontradas: ${orphanAddresses.length}`);
        
        if (orphanAddresses.length > 0) {
            await this.addressRepo.remove(orphanAddresses);
            this.logger.log(`Direcciones huérfanas eliminadas: ${orphanAddresses.length}`);
        }
        
        return {
            orphanAddressesFound: orphanAddresses.length,
            orphanAddressesRemoved: orphanAddresses.length
        };
    }

    async getDatabaseStats() {
        const totalAddresses = await this.addressRepo.count();
        const addressesWithUsers = await this.addressRepo
            .createQueryBuilder('address')
            .leftJoin('address.usuario', 'usuario')
            .where('usuario.id IS NOT NULL')
            .getCount();
        
        const addressesWithoutUsers = totalAddresses - addressesWithUsers;
        
        return {
            totalAddresses,
            addressesWithUsers,
            addressesWithoutUsers
        };
    }
}
