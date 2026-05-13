import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { SensitiveWordService } from '../moderation/sensitive-word.service';
import { ReportService } from '../report/report.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sensitiveWord: SensitiveWordService,
    private readonly reportService: ReportService,
  ) {}

  // ===== 审核队列 =====
  @Get('moderation/posts')
  async getReviewPosts() {
    return this.prisma.post.findMany({
      where: { status: 'REVIEWING' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Put('moderation/posts/:id')
  async handleReviewPost(
    @Param('id') id: string,
    @Body() body: { action: 'pass' | 'reject' },
  ) {
    const status = body.action === 'pass' ? 'PUBLISHED' : 'REJECTED';
    await this.prisma.post.update({ where: { id }, data: { status } });
    return { success: true };
  }

  // ===== 举报 =====
  @Get('reports')
  async getReports(@Query('status') status?: string) {
    const res = await this.reportService.list(
      status === 'PENDING' ? 'PENDING' : undefined,
    );
    return res.items;
  }

  @Put('reports/:id')
  async handleReport(
    @Param('id') id: string,
    @Body() body: { status: 'HANDLED' | 'REJECTED' },
  ) {
    await this.reportService.handle(+id, body.status);
    return { success: true };
  }

  // ===== 敏感词 =====
  @Get('sensitive-words')
  async getSensitiveWords() {
    return this.sensitiveWord.list();
  }

  @Post('sensitive-words')
  async addSensitiveWord(@Body() body: { word: string; category: string }) {
    return this.sensitiveWord.add(body.word, body.category as any);
  }

  @Delete('sensitive-words/:id')
  async deleteSensitiveWord(@Param('id') id: string) {
    await this.sensitiveWord.remove(+id);
    return { success: true };
  }

  // ===== 用户管理 =====
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        banUntil: true,
        createdAt: true,
      },
    });
  }

  @Post('users/:id/ban')
  async banUser(@Param('id') id: string, @Body() body: { days: number }) {
    const banUntil = new Date(Date.now() + body.days * 24 * 60 * 60 * 1000);
    await this.prisma.user.update({ where: { id }, data: { banUntil } });
    return { success: true, banUntil };
  }

  @Post('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    await this.prisma.user.update({ where: { id }, data: { banUntil: null } });
    return { success: true };
  }
}
