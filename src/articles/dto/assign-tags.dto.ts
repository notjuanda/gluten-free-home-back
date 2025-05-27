import { IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignTagsDto {
    @IsArray()
    @ArrayNotEmpty()
    tagIds: number[];
}
