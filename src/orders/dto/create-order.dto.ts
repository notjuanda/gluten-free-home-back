import {
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemInput {
    @IsNumber()
    @IsPositive()
    productoId: number;

    @IsNumber()
    @IsPositive()
    cantidad: number;
}

export class CreateOrderDto {
    @IsNumber()
    usuarioId: number;

    @IsNumber()
    direccionEnvioId: number;

    @IsNumber()
    totalBob: number;

    @IsOptional()
    @IsNumber()
    totalUsd?: number;

    @IsNumber()
    costoEnvioBob: number;

    @IsOptional()
    @IsNumber()
    costoEnvioUsd?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemInput)
    items: OrderItemInput[];
}
