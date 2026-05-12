import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

const BREEDS: Record<string, string[]> = {
  CAT: [
    '中华田园猫',
    '英国短毛猫',
    '美国短毛猫',
    '布偶猫',
    '加菲猫',
    '暹罗猫',
    '波斯猫',
    '苏格兰折耳猫',
    '俄罗斯蓝猫',
    '缅因猫',
    '无毛猫',
    '其他',
  ],
  DOG: [
    '中华田园犬',
    '柴犬',
    '金毛',
    '拉布拉多',
    '泰迪',
    '比熊',
    '边境牧羊犬',
    '哈士奇',
    '萨摩耶',
    '柯基',
    '柯基（彭布罗克）',
    '法国斗牛犬',
    '英国斗牛犬',
    '阿拉斯加',
    '博美',
    '雪纳瑞',
    '吉娃娃',
    '其他',
  ],
  OTHER: ['仓鼠', '兔子', '龙猫', '荷兰猪', '鹦鹉', '乌龟', '其他'],
};

@Controller('breed')
export class BreedController {
  @Public()
  @Get(':type')
  list(@Param('type') type: string) {
    const upper = type.toUpperCase();
    return BREEDS[upper] ?? [];
  }
}
