import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { EmailStatus } from '../common/enums/email-status.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) {}

    async create(dto: CreateUserDto) {
        const exists = await this.userRepo.findOne({
            where: [
                { correo: dto.correo },
                { nombreUsuario: dto.nombreUsuario },
            ],
        });

        if (exists) throw new ConflictException('Correo o usuario ya registrado');

        const contraseñaHash = await bcrypt.hash(dto.contraseña, 10);

        const user = this.userRepo.create({
            ...dto,
            contraseñaHash,
            estadoCorreo: EmailStatus.VERIFICADO,
        });

        if (dto.rolesIds?.length) {
            const roles = await this.roleRepo.findBy({ id: In(dto.rolesIds) });
            user.roles = roles;
        }

        return this.userRepo.save(user);
    }

    findAll() {
        return this.userRepo.find();
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        if (dto.contraseña) {
            user.contraseñaHash = await bcrypt.hash(dto.contraseña, 10);
        }

        if (dto.rolesIds) {
            const roles = await this.roleRepo.findBy({ id: In(dto.rolesIds) });
            user.roles = roles;
        }

        Object.assign(user, dto);
        return this.userRepo.save(user);
    }

    async remove(id: number) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return this.userRepo.remove(user);
    }
}
