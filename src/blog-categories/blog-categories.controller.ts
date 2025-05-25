import { Controller } from '@nestjs/common';
import { BlogCategoriesService } from './blog-categories.service';

@Controller('blog-categories')
export class BlogCategoriesController {
    constructor(
        private readonly blogCategoriesService: BlogCategoriesService,
    ) {}
}
