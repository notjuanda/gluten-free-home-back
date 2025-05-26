import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlogCategory } from '../../blog-categories/entities/blog-categorie.entity';
import { Tag } from '../../tags/entities/tag.entities';
import { Comment } from '../../comments/entities/comment.entity';
import { PublicationStatus } from '../../common/enums/publication-status.enum';

@Entity({ name: 'articles' })
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (u) => u.articulos)
    autor: User;

    @Column()
    titulo: string;

    @Column({ unique: true })
    slug: string;

    @Column('text')
    contenidoMd: string;

    @Column({ type: 'text', nullable: true })
    resumen?: string;

    @Column({ nullable: true })
    urlPortada?: string;

    @Column({ nullable: true })
    textoAltPortada?: string;

    @Column({
        type: 'enum',
        enum: PublicationStatus,
        default: PublicationStatus.BORRADOR,
    })
    estadoPublicacion: PublicationStatus;

    @Column({ type: 'timestamp', nullable: true })
    fechaPublicacion?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* ───── Relaciones ───── */
    @ManyToMany(() => BlogCategory, (cat) => cat.articulos, { cascade: true })
    @JoinTable({ name: 'article_categories' })
    categorias: BlogCategory[];

    @ManyToMany(() => Tag, (t) => t.articulos, { cascade: true })
    @JoinTable({ name: 'article_tags' })
    tags: Tag[];

    @OneToMany(() => Comment, (c) => c.articulo)
    comentarios: Comment[];
}
