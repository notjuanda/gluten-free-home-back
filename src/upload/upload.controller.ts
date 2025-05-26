import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
        }),
    )
    async upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo');
        }

        const filename = await this.uploadService.saveFile(file);
        return { filename, message: 'Archivo subido correctamente' };
    }
}
