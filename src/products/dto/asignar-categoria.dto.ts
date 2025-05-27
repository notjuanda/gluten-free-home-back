import { IsNumber } from 'class-validator';

export class AsignarCategoriaDto {
    @IsNumber()
    categoriaId: number;
}
