import { IsEnum } from 'class-validator';
import { CommentStatus } from '../../common/enums/comment-status.enum';

export class ModerateCommentDto {
    @IsEnum(CommentStatus)
    estado: CommentStatus;
}
