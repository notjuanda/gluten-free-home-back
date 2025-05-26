import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';
import { CommentStatus } from '../../common/enums/comment-status.enum';

@Entity({ name: 'comments' })
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Article, (a) => a.comentarios, { onDelete: 'CASCADE' })
    articulo: Article;

    @ManyToOne(() => User, (u) => u.comentarios, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    usuario?: User;

    @Column('text')
    contenido: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        type: 'enum',
        enum: CommentStatus,
        enumName: 'comments_estado_enum',
        default: CommentStatus.PENDIENTE,
    })
    estado: CommentStatus;
}
