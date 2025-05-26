import {
    Controller,
    Post,
    Body,
    Res,
    HttpCode,
    Get,
    Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @HttpCode(200)
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { token, user } = await this.authService.login(dto);

        res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Inicio de sesión exitoso', user };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('authToken');
        return { message: 'Sesión cerrada' };
    }

    @Get('verify')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }
}
