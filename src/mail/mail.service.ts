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
        const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
        const from = this.configService.get('mail.from');

        await this.transporter.sendMail({
            from,
            to,
            subject: 'Verifica tu cuenta',
            html: `
            <div style="background-color: #2A3F32; padding: 2rem; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 12px; max-width: 600px; margin: auto; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
                <h2 style="color: #9BE9B9; font-weight: 600;">¡Bienvenido a nuestra plataforma!</h2>
                <p style="margin-top: 1rem; font-size: 1rem;">
                Gracias por registrarte. Para completar tu proceso, necesitamos que verifiques tu dirección de correo electrónico.
                </p>
                <p style="margin: 1rem 0;">
                Haz clic en el botón de abajo para verificar tu cuenta:
                </p>
                <div style="text-align: center; margin: 2rem 0;">
                <a href="${verificationUrl}" style="
                    background-color: #E2454B;
                    color: #ffffff;
                    padding: 0.75rem 1.5rem;
                    text-decoration: none;
                    font-weight: 500;
                    border-radius: 8px;
                    display: inline-block;
                    transition: background-color 0.3s ease;
                ">
                    Verificar cuenta
                </a>
                </div>
                <p style="font-size: 0.875rem; color: #cccccc;">
                Si no te registraste en nuestra plataforma, puedes ignorar este mensaje.
                </p>
                <p style="margin-top: 2rem; font-size: 0.75rem; color: #888888; text-align: center;">
                &copy; ${new Date().getFullYear()} Gluten-Free Home. Todos los derechos reservados.
                </p>
            </div>
            `,
        });
    }
}
