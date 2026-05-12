import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePetDto,
  ) {
    try {
      return await this.petService.create(user.id, dto);
    } catch (err) {
      if ((err as Error & { status?: number }).status === 400) {
        throw new BadRequestException((err as Error).message);
      }
      throw err;
    }
  }

  @Get()
  async listMyPets(@CurrentUser() user: { id: string }) {
    return this.petService.findMyPets(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.petService.findById(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
  ) {
    try {
      return await this.petService.update(id, user.id, dto);
    } catch (err) {
      if ((err as Error & { status?: number }).status === 400) {
        throw new BadRequestException((err as Error).message);
      }
      throw err;
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.petService.remove(id, user.id);
  }
}
