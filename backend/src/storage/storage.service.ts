import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(private config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = config.get('BASE_URL') || 'http://localhost:3001';

    // Garante que o diretório de uploads existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const folderPath = path.join(this.uploadDir, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, file.buffer);

    return `${this.baseUrl}/uploads/${folder}/${filename}`;
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string): Promise<string[]> {
    return Promise.all(files.map(f => this.uploadFile(f, folder)));
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const relativePath = url.replace(`${this.baseUrl}/uploads/`, '');
      const filePath = path.join(this.uploadDir, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignora erros ao deletar
    }
  }
}
