import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión', description: 'Retorna JWT + datos del usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso — retorna access_token' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario actual' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Renovar access token', description: 'Renueva el JWT si el token actual es válido' })
  @ApiResponse({ status: 200, description: 'Nuevo access_token emitido' })
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.authService.refresh(req.user.id, req.user.email);
  }
}
