import { Injectable, OnModuleInit } from '@nestjs/common';
import { SensitiveCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const INITIAL_WORDS: { word: string; category: SensitiveCategory }[] = [
  { word: '六四', category: SensitiveCategory.POLITICS },
  { word: '法轮功', category: SensitiveCategory.POLITICS },
  { word: '习近平', category: SensitiveCategory.POLITICS },

  { word: '做爱', category: SensitiveCategory.PORN },
  { word: '色情', category: SensitiveCategory.PORN },
  { word: '黄片', category: SensitiveCategory.PORN },

  { word: '赌博', category: SensitiveCategory.GAMBLING },
  { word: '博彩', category: SensitiveCategory.GAMBLING },
  { word: '澳门威尼斯', category: SensitiveCategory.GAMBLING },

  { word: '加我微信', category: SensitiveCategory.AD },
  { word: '加V信', category: SensitiveCategory.AD },
  { word: '代购', category: SensitiveCategory.AD },
];

export interface LocalCheckResult {
  pass: boolean;
  matched: { word: string; category: SensitiveCategory }[];
}

@Injectable()
export class SensitiveWordService implements OnModuleInit {
  private words: { word: string; category: SensitiveCategory }[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedIfEmpty();
    await this.reload();
  }

  private async seedIfEmpty() {
    const count = await this.prisma.sensitiveWord.count();
    if (count === 0) {
      await this.prisma.sensitiveWord.createMany({
        data: INITIAL_WORDS,
        skipDuplicates: true,
      });
    }
  }

  async reload() {
    const all = await this.prisma.sensitiveWord.findMany();
    this.words = all.map((w) => ({ word: w.word, category: w.category }));
  }

  check(text: string): LocalCheckResult {
    const lower = text.toLowerCase();
    const matched = this.words.filter((w) =>
      lower.includes(w.word.toLowerCase()),
    );
    return { pass: matched.length === 0, matched };
  }

  async add(word: string, category: SensitiveCategory) {
    const record = await this.prisma.sensitiveWord.create({
      data: { word, category },
    });
    await this.reload();
    return record;
  }

  async remove(id: number) {
    await this.prisma.sensitiveWord.delete({ where: { id } });
    await this.reload();
  }

  async list() {
    return this.prisma.sensitiveWord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
