import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MailConfig } from './mail.config';
import { UploadConfig } from './upload.config';
import { StripeConfig } from './stripe.config';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: [MailConfig, UploadConfig, StripeConfig],
        }),
    ],
})
export class ConfigModule {}
