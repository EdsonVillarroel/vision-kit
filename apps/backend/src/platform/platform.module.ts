import { Module } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { PlatformAuthModule } from '../platform-auth/platform-auth.module';

@Module({
  imports: [PlatformAuthModule],
  providers: [PlatformService],
  controllers: [PlatformController],
})
export class PlatformModule {}
