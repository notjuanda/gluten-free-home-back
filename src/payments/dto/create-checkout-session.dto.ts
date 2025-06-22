import { IsNumber } from 'class-validator';

export class CreateCheckoutSessionDto {
    @IsNumber()
    pedidoId: number;
} 