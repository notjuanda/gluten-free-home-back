import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
    constructor(
        @InjectRepository(Ingredient)
        private readonly repo: Repository<Ingredient>,
    ) {}

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        const ing = await this.repo.findOneBy({ id });
        if (!ing) throw new NotFoundException('Ingrediente no encontrado');
        return ing;
    }

    async create(dto: CreateIngredientDto) {
        const ing = this.repo.create(dto);
        return this.repo.save(ing);
    }

    async update(id: number, dto: UpdateIngredientDto) {
        const ing = await this.repo.findOneBy({ id });
        if (!ing) throw new NotFoundException('Ingrediente no encontrado');
        Object.assign(ing, dto);
        return this.repo.save(ing);
    }

    async remove(id: number) {
        const ing = await this.repo.findOneBy({ id });
        if (!ing) throw new NotFoundException('Ingrediente no encontrado');
        return this.repo.remove(ing);
    }

    async getProductosUsan(id: number) {
        const ing = await this.repo.findOne({
            where: { id },
            relations: ['products'],
        });

        if (!ing) throw new NotFoundException('Ingrediente no encontrado');
        return ing.products;
    }
}
