import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailStatus } from '../common/enums/email-status.enum';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.userRepo.findOne({
            where: [
                { correo: dto.correo },
                { nombreUsuario: dto.nombreUsuario },
            ],
        });

        if (existing)
            throw new ConflictException('Usuario o correo ya registrado');

        const hash = await bcrypt.hash(dto.contraseña, 10);
        const user = this.userRepo.create({
            ...dto,
            contraseñaHash: hash,
            estadoCorreo: EmailStatus.EN_PROCESO,
        });

        const savedUser = await this.userRepo.save(user);
        const token = await this.generateEmailToken(savedUser);

        await this.mailService.sendVerificationEmail(savedUser.correo, token);
        return {
            message: 'Usuario registrado. Verifica tu correo electrónico',
        };
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({
            where: { correo: dto.correo },
            relations: ['roles', 'roles.permisos'],
        });

        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const isValid = await bcrypt.compare(
            dto.contraseña,
            user.contraseñaHash,
        );
        if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

        if (user.estadoCorreo !== EmailStatus.VERIFICADO) {
            throw new UnauthorizedException(
                'Debes verificar tu correo electrónico',
            );
        }

        const payload = {
            sub: user.id,
            nombreUsuario: user.nombreUsuario,
            correo: user.correo,
            nombreCompleto: user.nombreCompleto,
            roles: user.roles.map((r) => ({
                id: r.id,
                nombre: r.nombre,
            })),
        };
        console.log('Payload:', payload);

        const token = this.jwtService.sign(payload);

        return {
            token,
            user: {
                id: user.id,
                nombreUsuario: user.nombreUsuario,
                correo: user.correo,
                nombreCompleto: user.nombreCompleto,
                roles: payload.roles,
            },
        };
    }

    private async generateEmailToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            correo: user.correo,
        };
        return this.jwtService.sign(payload, { expiresIn: '1d' });
    }

    async verifyEmail(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userRepo.findOne({
                where: { id: payload.sub },
            });

            if (!user) throw new UnauthorizedException('Usuario no encontrado');

            if (user.estadoCorreo === EmailStatus.VERIFICADO) {
                return { message: 'La cuenta ya fue verificada anteriormente' };
            }

            user.estadoCorreo = EmailStatus.VERIFICADO;
            await this.userRepo.save(user);

            return { message: 'Correo verificado exitosamente' };
        } catch (err) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}
