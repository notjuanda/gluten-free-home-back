import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';
import { ModerateCommentDto } from './dto/moderate-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepo: Repository<Comment>,
        @InjectRepository(Article)
        private readonly articleRepo: Repository<Article>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    findAll() {
        return this.commentRepo.find({ relations: ['articulo', 'usuario'] });
    }

    async findByArticle(id: number) {
        return this.commentRepo.find({
            where: { articulo: { id } },
            relations: ['usuario'],
        });
    }

    async findByUser(id: number) {
        return this.commentRepo.find({
            where: { usuario: { id } },
            relations: ['articulo'],
        });
    }

    async create(dto: CreateCommentDto, userId?: number) {
        const articulo = await this.articleRepo.findOneBy({
            id: dto.articuloId,
        });
        if (!articulo) throw new NotFoundException('Artículo no encontrado');

        const comment = this.commentRepo.create({
            contenido: dto.contenido,
            articulo,
        });

        if (userId) {
            const usuario = await this.userRepo.findOneBy({
                id: userId,
            });
            if (usuario) {
                comment.usuario = usuario;
            }
        }

        return this.commentRepo.save(comment);
    }

    async moderate(id: number, dto: ModerateCommentDto) {
        const comment = await this.commentRepo.findOneBy({ id });
        if (!comment) throw new NotFoundException('Comentario no encontrado');

        comment.estado = dto.estado;
        return this.commentRepo.save(comment);
    }
}
