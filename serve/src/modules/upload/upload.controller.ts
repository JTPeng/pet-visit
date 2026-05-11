import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UploadService } from './upload.service';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const date = new Date().toISOString().slice(0, 7);
    const dir = join(process.cwd(), 'uploads', date);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new BadRequestException('不支持的图片格式'), false);
  }
  cb(null, true);
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择图片');
    }
    const date = new Date().toISOString().slice(0, 7);
    const key = `${date}/${file.filename}`;
    return this.uploadService.getFileUrl(key);
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 9, {
      storage,
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择图片');
    }
    const date = new Date().toISOString().slice(0, 7);
    return files.map((file) => {
      const key = `${date}/${file.filename}`;
      return this.uploadService.getFileUrl(key);
    });
  }
}
