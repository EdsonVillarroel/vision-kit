import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Listar usuarios — roles: super_admin, admin, manager' })
  @Roles('super_admin', 'admin', 'manager')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @Roles('super_admin', 'admin', 'manager')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear usuario — roles: super_admin, admin' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @Roles('super_admin', 'admin')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar usuario — roles: super_admin, admin' })
  @Roles('super_admin', 'admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar usuario — roles: super_admin, admin' })
  @Roles('super_admin', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Cambiar contraseña — propio usuario, admin o super_admin' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ) {
    if (req.user.id !== id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new ForbiddenException('Solo puedes cambiar tu propia contraseña');
    }
    return this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
  }
}
