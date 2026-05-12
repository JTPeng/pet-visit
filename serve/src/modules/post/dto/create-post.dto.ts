import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(9)
  images: string[];

  @IsOptional()
  @IsString()
  petId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3)
  tags?: string[];
}
