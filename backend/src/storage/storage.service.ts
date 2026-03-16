import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `imobmatch/${folder}`, resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        },
      ).end(file.buffer);
    });
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string): Promise<string[]> {
    return Promise.all(files.map(f => this.uploadFile(f, folder)));
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Extrai o public_id da URL do Cloudinary
      const match = url.match(/imobmatch\/[^/]+\/([^.]+)/);
      if (match) {
        await cloudinary.uploader.destroy(`imobmatch/${match[0].split('/').slice(1).join('/')}`);
      }
    } catch {
      // Ignora erros ao deletar
    }
  }
}
