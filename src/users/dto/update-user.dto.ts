import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    IsArray,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nombreUsuario?: string;

    @IsOptional()
    @IsEmail()
    correo?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    contraseña?: string;

    @IsOptional()
    @IsString()
    nombreCompleto?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsArray()
    rolesIds?: number[];
}
