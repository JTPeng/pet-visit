import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { InteractionService } from './interaction.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('post')
export class InteractionController {
  constructor(
    private readonly commentService: CommentService,
    private readonly interactionService: InteractionService,
  ) {}

  @Post(':postId/comment')
  async createComment(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, user.id, dto);
  }

  @Get(':postId/comments')
  async listComments(
    @Param('postId') postId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.commentService.listByPost(postId, +page, +pageSize);
  }

  @Delete('comment/:commentId')
  async deleteComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.delete(commentId, user.id);
  }

  @Post(':postId/like')
  async likePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.interactionService.likePost(user.id, postId);
  }

  @Delete(':postId/like')
  async unlikePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.interactionService.unlikePost(user.id, postId);
  }

  @Post('comment/:commentId/like')
  async likeComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
  ) {
    return this.interactionService.likeComment(user.id, commentId);
  }

  @Delete('comment/:commentId/like')
  async unlikeComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
  ) {
    return this.interactionService.unlikeComment(user.id, commentId);
  }

  @Post(':postId/collect')
  async collectPost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.interactionService.collectPost(user.id, postId);
  }

  @Delete(':postId/collect')
  async uncollectPost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
  ) {
    return this.interactionService.uncollectPost(user.id, postId);
  }

  @Get('collects')
  async myCollects(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.interactionService.myCollects(user.id, +page, +pageSize);
  }
}
