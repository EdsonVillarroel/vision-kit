import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'optico@visionkit.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'María García' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.optician })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://storage.supabase.co/avatars/abc.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
