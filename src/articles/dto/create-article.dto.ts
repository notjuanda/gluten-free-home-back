import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsArray,
    ValidateNested,
    IsNumber,
} from 'class-validator';
import { PublicationStatus } from '../../common/enums/publication-status.enum';
import { Type } from 'class-transformer';

export class ArticleBlockDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    data: any;

    @IsNumber()
    order: number;
}

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ArticleBlockDto)
    @IsOptional()
    contenidoBloques?: ArticleBlockDto[];
}
