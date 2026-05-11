import { IsString } from 'class-validator';

export class BindPhoneDto {
  @IsString()
  code: string;
}
