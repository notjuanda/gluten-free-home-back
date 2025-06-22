import { IsOptional, IsString } from 'class-validator';

export class SubirImagenDto {
    @IsOptional()
    @IsString()
    textoAlt?: string;
}
