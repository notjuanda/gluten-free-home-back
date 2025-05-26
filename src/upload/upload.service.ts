import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
    private readonly uploadPath = path.resolve(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async saveFile(file: Express.Multer.File): Promise<string> {
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(this.uploadPath, fileName);

        try {
            fs.writeFileSync(filePath, file.buffer);
            return fileName;
        } catch (error) {
            throw new InternalServerErrorException(
                'Error al guardar la imagen',
            );
        }
    }
}
