import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @MaxLength(80)
    nombreUsuario: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    contraseña: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    nombreCompleto?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    telefono?: string;
}
