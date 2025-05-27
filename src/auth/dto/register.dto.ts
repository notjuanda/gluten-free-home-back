import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    nombreUsuario: string;

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    contraseña: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    nombreCompleto?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    telefono?: string;
}
