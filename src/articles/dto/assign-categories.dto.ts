import { IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignCategoriesDto {
    @IsArray()
    @ArrayNotEmpty()
    categoryIds: number[];
}
