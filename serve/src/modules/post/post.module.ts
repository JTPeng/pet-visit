import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
import { CommentService } from './comment.service';

@Module({
  imports: [ModerationModule],
  controllers: [PostController, InteractionController],
  providers: [PostService, InteractionService, CommentService],
  exports: [PostService],
})
export class PostModule {}
