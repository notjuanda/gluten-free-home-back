import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    IsArray,
    IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    nombreUsuario: string;

    @IsNotEmpty()
    @IsEmail()
    correo: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    contraseña: string;

    @IsNotEmpty()
    @IsString()
    nombreCompleto?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsArray()
    rolesIds?: number[];
}
