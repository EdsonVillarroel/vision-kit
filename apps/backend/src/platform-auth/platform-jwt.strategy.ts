import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlatformJwtStrategy extends PassportStrategy(Strategy, 'jwt-platform') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: { sub: string; email: string; type: string }) {
    if (payload.type !== 'platform') {
      throw new UnauthorizedException();
    }
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, status: true },
    });
    if (!admin || admin.status === 'inactive') {
      throw new UnauthorizedException();
    }
    return admin;
  }
}
