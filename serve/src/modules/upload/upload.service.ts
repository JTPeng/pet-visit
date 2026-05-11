import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class UploadService {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const port = this.config.get<number>('port');
    this.baseUrl = `http://localhost:${port}/uploads`;
  }

  getFileUrl(filename: string): UploadResult {
    return {
      url: `${this.baseUrl}/${filename}`,
      key: filename,
    };
  }

  generateFilename(originalname: string): string {
    const ext = extname(originalname);
    const uuid = randomUUID();
    const date = new Date().toISOString().slice(0, 7);
    return `${date}/${uuid}${ext}`;
  }

  getUploadDir(): string {
    return join(process.cwd(), 'uploads');
  }
}
