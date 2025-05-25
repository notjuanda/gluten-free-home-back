import { ProductCategoryEntity } from './product-category.entity/product-category.entity';

describe('ProductCategoryEntity', () => {
    it('should be defined', () => {
        expect(new ProductCategoryEntity()).toBeDefined();
    });
});
