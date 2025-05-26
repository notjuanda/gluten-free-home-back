import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('mail.host'),
            port: this.configService.get('mail.port'),
            auth: {
                user: this.configService.get('mail.user'),
                pass: this.configService.get('mail.pass'),
            },
        });
    }

    async sendVerificationEmail(to: string, token: string) {
        const verificationUrl = `http://localhost:3000/auth/verify?token=${token}`;
        const from = this.configService.get('mail.from');

        await this.transporter.sendMail({
            from,
            to,
            subject: 'Verifica tu cuenta',
            html: `
        <h3>Bienvenido/a!</h3>
        <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
        <a href="${verificationUrl}">Verificar cuenta</a>
        `,
        });
    }
}
