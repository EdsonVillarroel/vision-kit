import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformLoginDto } from './dto/platform-login.dto';

@Injectable()
export class PlatformAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: PlatformLoginDto) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !(await bcrypt.compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (admin.status === 'inactive') {
      throw new UnauthorizedException('Administrador inactivo');
    }

    const payload = { sub: admin.id, email: admin.email, type: 'platform' };
    const token = this.jwtService.sign(payload);

    const { passwordHash: _, ...adminWithoutPassword } = admin;
    return { access_token: token, admin: adminWithoutPassword };
  }

  async me(adminId: string) {
    return this.prisma.platformAdmin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, status: true, createdAt: true },
    });
  }

  async refresh(adminId: string, email: string) {
    const payload = { sub: adminId, email, type: 'platform' };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
