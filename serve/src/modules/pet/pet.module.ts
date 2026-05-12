import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';

@Module({
  imports: [ModerationModule],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
