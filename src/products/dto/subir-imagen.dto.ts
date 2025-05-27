import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubirImagenDto {
    @IsNotEmpty()
    @IsString()
    urlImagen: string;

    @IsOptional()
    @IsString()
    textoAlt?: string;
}
