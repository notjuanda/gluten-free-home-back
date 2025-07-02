import { IsNumber } from 'class-validator';

export class AsignarDireccionDto {
    @IsNumber()
    direccionId: number;
}
