import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';

@Entity({ name: 'tags' })
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ unique: true })
    slug: string;

    @ManyToMany(() => Article, (a) => a.tags)
    articulos: Article[];
}
