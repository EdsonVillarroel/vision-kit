import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'nuevaPass123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
