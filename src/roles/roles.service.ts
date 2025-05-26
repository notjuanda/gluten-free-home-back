import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
    ) {}

    findAll() {
        return this.roleRepo.find({ relations: ['permisos'] });
    }

    findOne(id: number) {
        return this.roleRepo.findOne({
            where: { id },
            relations: ['permisos'],
        });
    }

    async create(dto: CreateRoleDto) {
        const role = this.roleRepo.create({ nombre: dto.nombre });

        if (dto.permisosIds?.length) {
            const permisos = await this.permissionRepo.findBy({
                id: In(dto.permisosIds),
            });
            role.permisos = permisos;
        }

        return this.roleRepo.save(role);
    }

    async update(id: number, dto: UpdateRoleDto) {
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: ['permisos'],
        });
        if (!role) throw new NotFoundException('Rol no encontrado');

        role.nombre = dto.nombre ?? role.nombre;

        if (dto.permisosIds) {
            const permisos = await this.permissionRepo.findBy({
                id: In(dto.permisosIds),
            });
            role.permisos = permisos;
        }

        return this.roleRepo.save(role);
    }

    async remove(id: number) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException('Rol no encontrado');
        return this.roleRepo.remove(role);
    }
}
