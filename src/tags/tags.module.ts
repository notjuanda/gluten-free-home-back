import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Tag])],  
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TypeOrmModule],
})
export class TagsModule {}
