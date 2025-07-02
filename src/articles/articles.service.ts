import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository, In } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BlogCategory } from '../blog-categories/entities/blog-categorie.entity';
import { Tag } from '../tags/entities/tag.entities';
import { User } from '../users/entities/user.entity';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepo: Repository<Article>,
        @InjectRepository(BlogCategory)
        private readonly catRepo: Repository<BlogCategory>,
        @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly uploadService: UploadService,
    ) {}

    findAll() {
        return this.articleRepo.find({
            relations: ['autor', 'tags', 'categorias', 'comentarios'],
        });
    }

    async findOne(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['autor', 'tags', 'categorias', 'comentarios'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art;
    }

    async create(dto: CreateArticleDto, userId: number) {
        try {
            // Buscar el usuario
            const user = await this.userRepo.findOneBy({ id: userId });
            if (!user) {
                throw new BadRequestException('Usuario no encontrado. Verifica tu sesión.');
            }

            // Validar que el slug no exista
            const existingArticle = await this.articleRepo.findOneBy({ slug: dto.slug });
            if (existingArticle) {
                throw new ConflictException(`El slug "${dto.slug}" ya está en uso. Por favor, usa un slug único.`);
            }

            // Validar título
            if (!dto.titulo || dto.titulo.trim().length < 3) {
                throw new BadRequestException('El título debe tener al menos 3 caracteres.');
            }

            if (dto.titulo.length > 200) {
                throw new BadRequestException('El título no puede exceder los 200 caracteres.');
            }

            // Validar slug
            if (!dto.slug || dto.slug.trim().length < 3) {
                throw new BadRequestException('El slug debe tener al menos 3 caracteres.');
            }

            if (dto.slug.length > 50) {
                throw new BadRequestException('El slug no puede exceder los 50 caracteres.');
            }

            if (!/^[a-z0-9-]+$/.test(dto.slug)) {
                throw new BadRequestException('El slug solo puede contener letras minúsculas, números y guiones.');
            }

            // Validar contenido
            if (!dto.contenidoBloques || dto.contenidoBloques.length === 0) {
                throw new BadRequestException('El artículo debe tener contenido.');
            }

            const articulo = this.articleRepo.create(dto);
            
            // Asignar el autor automáticamente
            articulo.autor = user;
            
            // Establecer fecha de publicación si no se proporciona
            if (!articulo.fechaPublicacion) {
                articulo.fechaPublicacion = new Date();
            }

            // Validar y asignar categorías si se proporcionan
            if (dto.categoriasIds?.length) {
                const categorias = await this.catRepo.findBy({
                    id: In(dto.categoriasIds),
                });
                
                if (categorias.length !== dto.categoriasIds.length) {
                    const foundIds = categorias.map(cat => cat.id);
                    const missingIds = dto.categoriasIds.filter(id => !foundIds.includes(id));
                    throw new BadRequestException(`Las siguientes categorías no existen: ${missingIds.join(', ')}`);
                }
                
                articulo.categorias = categorias;
            }

            // Validar y asignar tags si se proporcionan
            if (dto.tagsIds?.length) {
                const tags = await this.tagRepo.findBy({ id: In(dto.tagsIds) });
                
                if (tags.length !== dto.tagsIds.length) {
                    const foundIds = tags.map(tag => tag.id);
                    const missingIds = dto.tagsIds.filter(id => !foundIds.includes(id));
                    throw new BadRequestException(`Los siguientes tags no existen: ${missingIds.join(', ')}`);
                }
                
                articulo.tags = tags;
            }

            return await this.articleRepo.save(articulo);
        } catch (error) {
            // Re-lanzar errores específicos de NestJS
            if (error instanceof ConflictException || 
                error instanceof BadRequestException || 
                error instanceof NotFoundException) {
                throw error;
            }
            
            // Manejar errores específicos de PostgreSQL
            if (error.code === '23505') { // Código de PostgreSQL para violación de unicidad
                if (error.detail?.includes('slug')) {
                    throw new ConflictException(`El slug "${dto.slug}" ya está en uso. Por favor, usa un slug único.`);
                }
                if (error.detail?.includes('titulo')) {
                    throw new ConflictException('Ya existe un artículo con este título. Usa un título único.');
                }
                throw new ConflictException('Ya existe un artículo con estos datos. Verifica la información.');
            }
            
            if (error.code === '23503') { // Violación de clave foránea
                throw new BadRequestException('Error de referencia. Verifica que las categorías y tags existan.');
            }
            
            if (error.code === '23514') { // Violación de restricción de verificación
                throw new BadRequestException('Los datos no cumplen con las restricciones de validación.');
            }
            
            // Error genérico
            console.error('Error al crear artículo:', error);
            throw new BadRequestException('Error al crear el artículo. Verifica los datos e intenta nuevamente.');
        }
    }

    async update(id: number, dto: UpdateArticleDto) {
        try {
            const art = await this.articleRepo.findOneBy({ id });
            if (!art) throw new NotFoundException('Artículo no encontrado');

            // Validar slug único si se está actualizando
            if (dto.slug && dto.slug !== art.slug) {
                const existingArticle = await this.articleRepo.findOneBy({ slug: dto.slug });
                if (existingArticle) {
                    throw new ConflictException(`El slug "${dto.slug}" ya está en uso. Por favor, usa un slug único.`);
                }
            }

            // Validar título si se está actualizando
            if (dto.titulo) {
                if (dto.titulo.trim().length < 3) {
                    throw new BadRequestException('El título debe tener al menos 3 caracteres.');
                }
                if (dto.titulo.length > 200) {
                    throw new BadRequestException('El título no puede exceder los 200 caracteres.');
                }
            }

            // Validar slug si se está actualizando
            if (dto.slug) {
                if (dto.slug.trim().length < 3) {
                    throw new BadRequestException('El slug debe tener al menos 3 caracteres.');
                }
                if (dto.slug.length > 50) {
                    throw new BadRequestException('El slug no puede exceder los 50 caracteres.');
                }
                if (!/^[a-z0-9-]+$/.test(dto.slug)) {
                    throw new BadRequestException('El slug solo puede contener letras minúsculas, números y guiones.');
                }
            }

            Object.assign(art, dto);
            return await this.articleRepo.save(art);
        } catch (error) {
            // Re-lanzar errores específicos de NestJS
            if (error instanceof ConflictException || 
                error instanceof BadRequestException || 
                error instanceof NotFoundException) {
                throw error;
            }
            
            // Manejar errores específicos de PostgreSQL
            if (error.code === '23505') { // Código de PostgreSQL para violación de unicidad
                if (error.detail?.includes('slug')) {
                    throw new ConflictException(`El slug "${dto.slug}" ya está en uso. Por favor, usa un slug único.`);
                }
                if (error.detail?.includes('titulo')) {
                    throw new ConflictException('Ya existe un artículo con este título. Usa un título único.');
                }
                throw new ConflictException('Ya existe un artículo con estos datos. Verifica la información.');
            }
            
            if (error.code === '23503') { // Violación de clave foránea
                throw new BadRequestException('Error de referencia. Verifica que las categorías y tags existan.');
            }
            
            if (error.code === '23514') { // Violación de restricción de verificación
                throw new BadRequestException('Los datos no cumplen con las restricciones de validación.');
            }
            
            // Error genérico
            console.error('Error al actualizar artículo:', error);
            throw new BadRequestException('Error al actualizar el artículo. Verifica los datos e intenta nuevamente.');
        }
    }

    async remove(id: number) {
        try {
            const art = await this.articleRepo.findOneBy({ id });
            if (!art) throw new NotFoundException('Artículo no encontrado');
            
            // Eliminar imagen de portada si existe
            if (art.urlPortada) {
                try {
                    const filename = art.urlPortada.replace('/files/', '');
                    const filePath = path.resolve(process.cwd(), 'uploads', filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Imagen de portada eliminada: ${filename}`);
                    }
                } catch (fileError) {
                    console.warn(`No se pudo eliminar la imagen de portada: ${art.urlPortada}`, fileError);
                    // No lanzamos error aquí para que el artículo se elimine aunque falle la eliminación del archivo
                }
            }
            
            return await this.articleRepo.remove(art);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            console.error('Error al eliminar artículo:', error);
            throw new BadRequestException('Error al eliminar el artículo. Intenta nuevamente.');
        }
    }

    async assignTags(id: number, tagIds: number[]) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        
        // Si no hay tagIds o está vacío, asignar array vacío (desasignar todos)
        if (!tagIds || tagIds.length === 0) {
            art.tags = [];
            return this.articleRepo.save(art);
        }
        
        const tags = await this.tagRepo.findBy({ id: In(tagIds) });
        if (tags.length !== tagIds.length) {
            const foundIds = tags.map(tag => tag.id);
            const missingIds = tagIds.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Los siguientes tags no existen: ${missingIds.join(', ')}`);
        }
        
        art.tags = tags;
        return this.articleRepo.save(art);
    }

    async assignCategories(id: number, categoryIds: number[]) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        
        // Si no hay categoryIds o está vacío, asignar array vacío (desasignar todas)
        if (!categoryIds || categoryIds.length === 0) {
            art.categorias = [];
            return this.articleRepo.save(art);
        }
        
        const categorias = await this.catRepo.findBy({ id: In(categoryIds) });
        if (categorias.length !== categoryIds.length) {
            const foundIds = categorias.map(cat => cat.id);
            const missingIds = categoryIds.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Las siguientes categorías no existen: ${missingIds.join(', ')}`);
        }
        
        art.categorias = categorias;
        return this.articleRepo.save(art);
    }

    async getTags(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['tags'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art.tags;
    }

    async getCategories(id: number) {
        const art = await this.articleRepo.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        return art.categorias;
    }

    async uploadPortada(id: number, file: Express.Multer.File, textoAlt?: string) {
        const art = await this.articleRepo.findOneBy({ id });
        if (!art) throw new NotFoundException('Artículo no encontrado');
        
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo.');
        }
        
        // Validar tipo de archivo
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Solo se permiten archivos de imagen.');
        }
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB.');
        }
        
        // Eliminar imagen anterior si existe
        if (art.urlPortada) {
            const filename = art.urlPortada.replace('/files/', '');
            const filePath = path.resolve(process.cwd(), 'uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        const filename = await this.uploadService.saveFile(file);
        art.urlPortada = `/files/${filename}`;
        if (textoAlt) art.textoAltPortada = textoAlt;
        return this.articleRepo.save(art);
    }

    async uploadBlockImage(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo.');
        }
        
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Solo se permiten archivos de imagen.');
        }
        
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB.');
        }
        
        const filename = await this.uploadService.saveFile(file);
        return { url: `/files/${filename}` };
    }
}
