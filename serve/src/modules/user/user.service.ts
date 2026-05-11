import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        bio: true,
        phone: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    });

    if (!user) throw new NotFoundException('用户不存在');

    return {
      ...user,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      _count: undefined,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    });

    if (!user) throw new NotFoundException('用户不存在');

    return {
      ...user,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      _count: undefined,
    };
  }
}
