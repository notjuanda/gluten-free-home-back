import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsArray,
} from 'class-validator';
import { PublicationStatus } from '../../common/enums/publication-status.enum';

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsNotEmpty()
    contenidoMd: string;

    @IsString()
    @IsOptional()
    resumen?: string;

    @IsString()
    @IsOptional()
    urlPortada?: string;

    @IsString()
    @IsOptional()
    textoAltPortada?: string;

    @IsEnum(PublicationStatus)
    @IsOptional()
    estadoPublicacion?: PublicationStatus;

    @IsArray()
    @IsOptional()
    categoriasIds?: number[];

    @IsArray()
    @IsOptional()
    tagsIds?: number[];
}
