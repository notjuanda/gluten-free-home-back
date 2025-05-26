import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
    ) {}

    findAll() {
        return this.permissionRepo.find();
    }

    findOne(id: number) {
        return this.permissionRepo.findOne({ where: { id } });
    }

    async create(data: Partial<Permission>) {
        const permission = this.permissionRepo.create(data);
        return await this.permissionRepo.save(permission);
    }

    async update(id: number, data: Partial<Permission>) {
        const existing = await this.permissionRepo.findOne({ where: { id } });
        if (!existing) throw new NotFoundException('Permiso no encontrado');

        const updated = this.permissionRepo.merge(existing, data);
        return await this.permissionRepo.save(updated);
    }

    async remove(id: number) {
        const permission = await this.permissionRepo.findOne({ where: { id } });
        if (!permission) throw new NotFoundException('Permiso no encontrado');
        return await this.permissionRepo.remove(permission);
    }
}
