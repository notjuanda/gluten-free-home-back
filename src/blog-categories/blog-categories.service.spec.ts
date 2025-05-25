import { Test, TestingModule } from '@nestjs/testing';
import { BlogCategoriesService } from './blog-categories.service';

describe('BlogCategoriesService', () => {
    let service: BlogCategoriesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BlogCategoriesService],
        }).compile();

        service = module.get<BlogCategoriesService>(BlogCategoriesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
