import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateCommentDto {
    @IsInt()
    @IsNotEmpty()
    articuloId: number;

    @IsString()
    @IsNotEmpty()
    contenido: string;

    @IsInt()
    @IsOptional()
    usuarioId?: number;
}
