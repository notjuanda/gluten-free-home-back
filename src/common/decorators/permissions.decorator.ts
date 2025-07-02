import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permisos: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permisos);
