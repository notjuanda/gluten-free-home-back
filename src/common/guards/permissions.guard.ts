import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../roles/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly dataSource: DataSource,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requeridos = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requeridos?.length) return true;

        const req = context.switchToHttp().getRequest();
        const usuario = req.user;

        if (!usuario || !Array.isArray(usuario.roles)) {
            throw new ForbiddenException('Acceso denegado: usuario sin roles');
        }

        const roleIds: number[] = usuario.roles.map((r: any) => r.id);
        if (!roleIds.length) {
            throw new ForbiddenException(
                'Acceso denegado: sin roles asignados',
            );
        }

        const roleRepo = this.dataSource.getRepository(Role);
        const roles = await roleRepo.find({
            where: { id: In(roleIds) },
            relations: ['permisos'],
        });

        const permisosUsuario = roles.flatMap((rol) =>
            rol.permisos.map((p) => p.clavePermiso),
        );

        const ok = requeridos.every((p) => permisosUsuario.includes(p));
        if (!ok) throw new ForbiddenException('No tienes permisos suficientes');

        req.user.permisos = permisosUsuario;
        return true;
    }
}
