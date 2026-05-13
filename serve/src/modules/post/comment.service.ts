import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderation: ModerationService,
  ) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException('帖子不存在');
    }

    const check = await this.moderation.checkText(dto.content);
    if (check.verdict === 'reject') {
      throw new BadRequestException(check.reason ?? '评论包含敏感词');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async listByPost(postId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null },
        include: {
          author: { select: { id: true, nickname: true, avatar: true } },
          replies: {
            include: {
              author: { select: { id: true, nickname: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 3,
          },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where: { postId, parentId: null } }),
    ]);
    return { items, total, page, pageSize };
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.authorId !== userId) {
      throw new BadRequestException('无权删除');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    return { success: true };
  }
}
