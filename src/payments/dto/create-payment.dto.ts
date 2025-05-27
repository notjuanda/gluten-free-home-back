import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class CreatePaymentDto {
    @IsNotEmpty()
    pedidoId: number;

    @IsString()
    metodo: string;

    @IsNumber()
    montoBob: number;

    @IsOptional()
    @IsNumber()
    montoUsd?: number;

    @IsNotEmpty()
    fechaPago: Date;

    @IsOptional()
    @IsEnum(PaymentStatus)
    estado?: PaymentStatus;
}
