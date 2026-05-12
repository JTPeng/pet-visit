import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderation: ModerationService,
  ) {}

  async create(ownerId: string, dto: CreatePetDto) {
    await this.checkContent(dto);
    return this.prisma.pet.create({
      data: {
        ownerId,
        name: dto.name,
        type: dto.type,
        breed: dto.breed,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(dto.birthday) : null,
        weight: dto.weight,
        avatar: dto.avatar,
        note: dto.note,
      },
    });
  }

  async findMyPets(ownerId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string, currentUserId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('宠物不存在');
    if (pet.ownerId !== currentUserId && !pet.isPublic) {
      throw new ForbiddenException('无权访问该宠物档案');
    }
    return pet;
  }

  async update(id: string, ownerId: string, dto: UpdatePetDto) {
    await this.ensureOwner(id, ownerId);
    await this.checkContent(dto);
    return this.prisma.pet.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.breed !== undefined && { breed: dto.breed }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.birthday !== undefined && {
          birthday: dto.birthday ? new Date(dto.birthday) : null,
        }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });
  }

  async remove(id: string, ownerId: string) {
    await this.ensureOwner(id, ownerId);
    await this.prisma.pet.delete({ where: { id } });
    return { success: true };
  }

  private async ensureOwner(id: string, ownerId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('宠物不存在');
    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('无权操作该宠物档案');
    }
  }

  private async checkContent(dto: CreatePetDto | UpdatePetDto) {
    const fields = [dto.name, dto.breed, dto.note].filter(Boolean) as string[];
    for (const text of fields) {
      const result = await this.moderation.checkText(text);
      if (result.verdict === 'reject') {
        const err = new Error(result.reason ?? '内容包含敏感词');
        (err as Error & { status?: number }).status = 400;
        throw err;
      }
    }
  }
}
