import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    slug: string;
}
