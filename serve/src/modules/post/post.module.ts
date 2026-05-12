import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [ModerationModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
