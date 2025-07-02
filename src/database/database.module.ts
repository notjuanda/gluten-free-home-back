import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get<string>('DB_HOST'),
                port: cfg.get<number>('DB_PORT'),
                username: cfg.get<string>('DB_USER'),
                password: cfg.get<string>('DB_PASS'),
                database: cfg.get<string>('DB_NAME'),

                autoLoadEntities: true,

                synchronize: true,
                logging: true,
                poolSize: 10,
            }),
        }),
    ],

    exports: [TypeOrmModule],
})
export class DatabaseModule {}
