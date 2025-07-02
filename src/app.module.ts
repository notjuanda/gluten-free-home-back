import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CommentsModule } from './comments/comments.module';
import { ArticlesModule } from './articles/articles.module';
import { TagsModule } from './tags/tags.module';
import { BlogCategoriesModule } from './blog-categories/blog-categories.module';
import { PaymentsModule } from './payments/payments.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrdersModule } from './orders/orders.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { AddressesModule } from './addresses/addresses.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: path.join(process.cwd(), 'uploads'),
            serveRoot: '/files',
        }),

        ConfigModule,
        DatabaseModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
        AuthModule,
        BrandsModule,
        ProductsModule,
        ProductImagesModule,
        IngredientsModule,
        OrdersModule,
        OrderItemsModule,
        PaymentsModule,
        BlogCategoriesModule,
        TagsModule,
        ArticlesModule,
        CommentsModule,
        ProductCategoriesModule,
        UploadModule,
        MailModule,
        AddressesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
