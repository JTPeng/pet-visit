import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.create(user.id, dto);
  }

  @Public()
  @Get('feed/recommend')
  async recommendFeed(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.recommendFeed(+page, +pageSize);
  }

  @Get('feed/following')
  async followingFeed(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.followingFeed(user.id, +page, +pageSize);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.postService.findById(id, user?.id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.postService.remove(id, user.id);
  }
}
