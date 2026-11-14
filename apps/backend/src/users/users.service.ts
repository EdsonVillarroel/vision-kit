import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantPrismaService } from '../tenant/tenant-prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SELECT_USER = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  phone: true,
  commissionRate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  async findAll() {
    return this.tenantPrisma.client.user.findMany({ select: SELECT_USER });
  }

  async findOne(id: string) {
    const user = await this.tenantPrisma.client.user.findFirst({
      where: { id },
      select: SELECT_USER,
    });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  async create(dto: CreateUserDto) {
    if (dto.role === 'super_admin') {
      throw new ForbiddenException('El rol super_admin solo puede asignarse vía provisioning de plataforma');
    }

    const exists = await this.tenantPrisma.client.user.findFirst({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const { password, ...rest } = dto;
    return this.tenantPrisma.client.user.create({
      data: { ...rest, passwordHash: hashed },
      select: SELECT_USER,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.tenantPrisma.client.user.update({
      where: { id },
      data: dto,
      select: SELECT_USER,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.tenantPrisma.client.user.delete({ where: { id }, select: SELECT_USER });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.tenantPrisma.client.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Contraseña actual incorrecta');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.tenantPrisma.client.user.update({ where: { id }, data: { passwordHash: hashed } });
    return { message: 'Contraseña actualizada exitosamente' };
  }

  /** Restablece la contraseña sin pedir la actual (para quien la olvidó). Solo admin/super_admin. */
  async resetPassword(id: string, newPassword: string, actor: { id: string; role: string }) {
    if (actor.id === id) {
      throw new ForbiddenException('Para tu propia cuenta usa "Cambiar contraseña" en tu perfil');
    }

    const user = await this.tenantPrisma.client.user.findFirst({ where: { id }, select: { id: true, role: true } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    // Un admin no puede tomar control de la cuenta del super_admin
    if (user.role === 'super_admin' && actor.role !== 'super_admin') {
      throw new ForbiddenException('Solo el super_admin puede restablecer su propia contraseña');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.tenantPrisma.client.user.update({ where: { id }, data: { passwordHash: hashed } });
    return { message: 'Contraseña restablecida exitosamente' };
  }
}
