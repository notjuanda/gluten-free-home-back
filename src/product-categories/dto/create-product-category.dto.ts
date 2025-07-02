import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductCategoryDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    slug: string;
}
