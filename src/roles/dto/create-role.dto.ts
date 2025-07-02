import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsArray()
    @IsOptional()
    permisosIds?: number[];
}
