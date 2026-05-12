import { BadRequestException, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderation: ModerationService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const check = await this.moderation.checkText(dto.content);
    if (check.verdict === 'reject') {
      throw new BadRequestException(check.reason ?? '内容包含敏感词');
    }

    const status = check.verdict === 'review' ? 'REVIEWING' : 'PUBLISHED';

    return this.prisma.post.create({
      data: {
        authorId,
        content: dto.content,
        images: dto.images,
        petId: dto.petId,
        tags: dto.tags ?? [],
        status,
      },
    });
  }

  async findById(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!post || (post.status !== 'PUBLISHED' && post.authorId !== currentUserId)) {
      throw new NotFoundException('帖子不存在');
    }

    let isLiked = false;
    let isCollected = false;
    if (currentUserId) {
      const [like, collect] = await Promise.all([
        this.prisma.like.findFirst({
          where: { userId: currentUserId, targetType: 'POST', postId: id },
        }),
        this.prisma.collect.findUnique({
          where: { userId_postId: { userId: currentUserId, postId: id } },
        }),
      ]);
      isLiked = !!like;
      isCollected = !!collect;
    }

    return { ...post, isLiked, isCollected };
  }

  async recommendFeed(page = 1, pageSize = 20) {
    const now = Date.now();
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize * 2,
    });

    const scored = posts.map((p) => {
      const hot = p.likeCount * 1 + p.commentCount * 2 + p.collectCount * 1.5;
      const ageHours = (now - p.createdAt.getTime()) / (1000 * 60 * 60);
      let decay = 0.5;
      if (ageHours <= 24) decay = 2.0;
      else if (ageHours <= 72) decay = 1.0;
      return { ...p, score: hot * decay };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, pageSize);
  }

  async followingFeed(userId: string, page = 1, pageSize = 20) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    return this.prisma.post.findMany({
      where: { authorId: { in: followingIds }, status: 'PUBLISHED' },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('帖子不存在');
    if (post.authorId !== userId) throw new ForbiddenException('无权删除');
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}
