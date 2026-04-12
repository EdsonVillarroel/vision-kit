import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PlatformAuthService } from './platform-auth.service';
import { PlatformAuthController } from './platform-auth.controller';
import { PlatformJwtStrategy } from './platform-jwt.strategy';
import { PlatformAuthGuard } from './platform-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [PlatformAuthService, PlatformJwtStrategy, PlatformAuthGuard],
  controllers: [PlatformAuthController],
  exports: [PlatformAuthGuard],
})
export class PlatformAuthModule {}
