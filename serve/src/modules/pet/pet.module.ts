import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { BreedController } from './breed.controller';

@Module({
  imports: [ModerationModule],
  controllers: [PetController, BreedController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
