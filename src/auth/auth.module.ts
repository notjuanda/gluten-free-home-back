import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtAuthModule } from '../common/jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        UsersModule,
        MailModule,
        JwtAuthModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
