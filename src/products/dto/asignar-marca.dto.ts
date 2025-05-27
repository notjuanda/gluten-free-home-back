import { IsNumber } from 'class-validator';

export class AsignarMarcaDto {
    @IsNumber()
    marcaId: number;
}
