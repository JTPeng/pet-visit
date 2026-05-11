import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
  async follow(
    @CurrentUser() user: { id: string },
    @Param('id') followingId: string,
  ) {
    return this.followService.follow(user.id, followingId);
  }

  @Delete(':id')
  async unfollow(
    @CurrentUser() user: { id: string },
    @Param('id') followingId: string,
  ) {
    return this.followService.unfollow(user.id, followingId);
  }

  @Get('followers')
  async getFollowers(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.followService.getFollowers(user.id, page, pageSize);
  }

  @Get('following')
  async getFollowing(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.followService.getFollowing(user.id, page, pageSize);
  }

  @Get('check/:id')
  async isFollowing(
    @CurrentUser() user: { id: string },
    @Param('id') followingId: string,
  ) {
    return this.followService.isFollowing(user.id, followingId);
  }
}
