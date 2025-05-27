import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsArray()
    permisosIds?: number[];
}
