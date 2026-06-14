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
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_PLATFORM_SECRET;
        if (!secret) throw new Error('JWT_PLATFORM_SECRET no está definido');
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_PLATFORM_EXPIRES_IN || '1d' },
        };
      },
    }),
  ],
  providers: [PlatformAuthService, PlatformJwtStrategy, PlatformAuthGuard],
  controllers: [PlatformAuthController],
  exports: [PlatformAuthGuard],
})
export class PlatformAuthModule {}
