import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    slug: string;
}
