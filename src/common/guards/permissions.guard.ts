import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!permisosRequeridos || permisosRequeridos.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const usuario = request.user;

        if (!usuario || !Array.isArray(usuario.roles)) {
            throw new ForbiddenException('Acceso denegado: usuario sin roles');
        }

        const permisosUsuario = usuario.roles.flatMap((rol) =>
            Array.isArray(rol.permisos)
                ? rol.permisos.map((p) => p.clavePermiso)
                : [],
        );

        const tienePermiso = permisosRequeridos.every((permiso) =>
            permisosUsuario.includes(permiso),
        );

        if (!tienePermiso) {
            throw new ForbiddenException('No tienes permisos suficientes');
        }

        return true;
    }
}
