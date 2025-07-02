import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsNumber()
    @IsPositive()
    precioBob: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    precioUsd?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    stock?: number;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsBoolean()
    certificadoSinGluten?: boolean;

    @IsOptional()
    @IsString()
    urlCertificado?: string;

    @IsOptional()
    @IsNumber()
    marcaId?: number;

    @IsNumber()
    categoriaId: number;

    @IsOptional()
    @IsArray()
    ingredientesIds?: number[];
}
