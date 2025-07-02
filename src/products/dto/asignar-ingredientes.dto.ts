import { IsArray, IsNumber } from 'class-validator';

export class AsignarIngredientesDto {
    @IsArray()
    ingredientesIds: number[];
}
