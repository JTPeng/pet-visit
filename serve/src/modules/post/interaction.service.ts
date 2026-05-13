import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InteractionService {
  constructor(private readonly prisma: PrismaService) {}

  async likePost(userId: string, postId: string) {
    const existing = await this.prisma.like.findFirst({
      where: { userId, targetType: 'POST', postId },
    });
    if (existing) return { success: true };

    await this.prisma.like.create({
      data: { userId, targetType: 'POST', postId },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
    return { success: true };
  }

  async unlikePost(userId: string, postId: string) {
    const existing = await this.prisma.like.findFirst({
      where: { userId, targetType: 'POST', postId },
    });
    if (!existing) return { success: true };

    await this.prisma.like.delete({ where: { id: existing.id } });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });
    return { success: true };
  }

  async likeComment(userId: string, commentId: string) {
    const existing = await this.prisma.like.findFirst({
      where: { userId, targetType: 'COMMENT', commentId },
    });
    if (existing) return { success: true };

    await this.prisma.like.create({
      data: { userId, targetType: 'COMMENT', commentId },
    });
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });
    return { success: true };
  }

  async unlikeComment(userId: string, commentId: string) {
    const existing = await this.prisma.like.findFirst({
      where: { userId, targetType: 'COMMENT', commentId },
    });
    if (!existing) return { success: true };

    await this.prisma.like.delete({ where: { id: existing.id } });
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });
    return { success: true };
  }

  async collectPost(userId: string, postId: string) {
    const existing = await this.prisma.collect.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) return { success: true };

    await this.prisma.collect.create({ data: { userId, postId } });
    await this.prisma.post.update({
      where: { id: postId },
      data: { collectCount: { increment: 1 } },
    });
    return { success: true };
  }

  async uncollectPost(userId: string, postId: string) {
    const existing = await this.prisma.collect.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) return { success: true };

    await this.prisma.collect.delete({ where: { id: existing.id } });
    await this.prisma.post.update({
      where: { id: postId },
      data: { collectCount: { decrement: 1 } },
    });
    return { success: true };
  }

  async myCollects(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.collect.findMany({
        where: { userId },
        include: {
          post: {
            include: {
              author: { select: { id: true, nickname: true, avatar: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.collect.count({ where: { userId } }),
    ]);
    return {
      items: items.map((c) => c.post),
      total,
      page,
      pageSize,
    };
  }
}
