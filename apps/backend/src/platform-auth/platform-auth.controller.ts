import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformAuthService } from './platform-auth.service';
import { PlatformLoginDto } from './dto/platform-login.dto';
import { PlatformAuthGuard } from './platform-auth.guard';

@ApiTags('platform-auth')
@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private platformAuthService: PlatformAuthService) {}

  @ApiOperation({ summary: 'Login para platform admins' })
  @ApiResponse({ status: 200, description: 'Login exitoso — retorna access_token' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o admin inactivo' })
  @Post('login')
  login(@Body() dto: PlatformLoginDto) {
    return this.platformAuthService.login(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener platform admin autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del platform admin' })
  @UseGuards(PlatformAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.platformAuthService.me(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Renovar access token para platform admin' })
  @ApiResponse({ status: 200, description: 'Nuevo access_token emitido' })
  @UseGuards(PlatformAuthGuard)
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.platformAuthService.refresh(req.user.id, req.user.email);
  }
}
