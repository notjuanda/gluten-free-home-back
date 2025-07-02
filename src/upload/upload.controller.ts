import {
    Controller,
    Post,
    Get,
    Param,
    Res,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { UploadService } from './upload.service';
import * as path from 'path';
import * as fs from 'fs';

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

    @Get('files/:filename')
    async serveFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Archivo no encontrado');
        }

        res.sendFile(filePath);
    }
}
