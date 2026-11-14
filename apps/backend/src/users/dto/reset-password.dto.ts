import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'nuevaPass123', description: 'Nueva contraseña (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
