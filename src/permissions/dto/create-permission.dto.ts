import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty()
    clavePermiso: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}
