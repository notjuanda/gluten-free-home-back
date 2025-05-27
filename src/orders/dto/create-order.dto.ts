import { IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsNumber()
    productoId: number;

    @IsNumber()
    cantidad: number;
}

export class CreateOrderDto {
    @IsNumber()
    totalBob: number;

    @IsOptional()
    @IsNumber()
    totalUsd?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
