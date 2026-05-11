import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('不能关注自己');
    }

    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });

    return { success: true };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });

    return { success: true };
  }

  async getFollowers(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        select: {
          createdAt: true,
          follower: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      items: items.map((i) => ({ ...i.follower, followedAt: i.createdAt })),
      total,
      page,
      pageSize,
    };
  }

  async getFollowing(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        select: {
          createdAt: true,
          following: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      items: items.map((i) => ({ ...i.following, followedAt: i.createdAt })),
      total,
      page,
      pageSize,
    };
  }

  async isFollowing(followerId: string, followingId: string) {
    const record = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    return { isFollowing: !!record };
  }
}
