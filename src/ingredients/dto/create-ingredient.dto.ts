import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
