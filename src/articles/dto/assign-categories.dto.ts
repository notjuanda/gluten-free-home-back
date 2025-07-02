import { IsArray } from 'class-validator';

export class AssignCategoriesDto {
    @IsArray()
    categoryIds: number[];
}
