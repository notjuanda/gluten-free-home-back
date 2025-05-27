import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private readonly repo: Repository<Brand>,
    ) {}

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        const brand = await this.repo.findOneBy({ id });
        if (!brand) throw new NotFoundException('Marca no encontrada');
        return brand;
    }

    async create(dto: CreateBrandDto) {
        const brand = this.repo.create(dto);
        return this.repo.save(brand);
    }

    async update(id: number, dto: UpdateBrandDto) {
        const brand = await this.repo.findOneBy({ id });
        if (!brand) throw new NotFoundException('Marca no encontrada');
        Object.assign(brand, dto);
        return this.repo.save(brand);
    }

    async remove(id: number) {
        const brand = await this.repo.findOneBy({ id });
        if (!brand) throw new NotFoundException('Marca no encontrada');
        return this.repo.remove(brand);
    }
}
