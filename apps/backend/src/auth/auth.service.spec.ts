import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService.login', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  const passwordHashFor = async (plain: string) => bcrypt.hash(plain, 4);

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('devuelve token + user (sin passwordHash) con credenciales válidas', async () => {
    const passwordHash = await passwordHashFor('correctPass1!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      tenantId: 'tenant-A',
      role: 'admin',
      status: 'active',
      name: 'Test User',
    });

    const result = await service.login({ email: 'a@b.com', password: 'correctPass1!' });

    expect(result.access_token).toBe('signed-jwt-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user).toMatchObject({ id: 'u1', email: 'a@b.com', tenantId: 'tenant-A' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'a@b.com',
      tenantId: 'tenant-A',
      role: 'admin',
    });
  });

  it('lanza UnauthorizedException si el usuario no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'noexiste@b.com', password: 'whatever' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
    const passwordHash = await passwordHashFor('correctPass1!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      tenantId: 'tenant-A',
      role: 'admin',
      status: 'active',
    });

    await expect(
      service.login({ email: 'a@b.com', password: 'wrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('lanza UnauthorizedException si el usuario está inactivo', async () => {
    const passwordHash = await passwordHashFor('correctPass1!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      tenantId: 'tenant-A',
      role: 'admin',
      status: 'inactive',
    });

    await expect(
      service.login({ email: 'a@b.com', password: 'correctPass1!' }),
    ).rejects.toThrow(/Usuario inactivo/);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('NUNCA filtra passwordHash en la respuesta exitosa', async () => {
    const passwordHash = await passwordHashFor('correctPass1!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      tenantId: 'tenant-A',
      role: 'admin',
      status: 'active',
      sensitiveField: 'should-not-leak',
    });

    const result = await service.login({ email: 'a@b.com', password: 'correctPass1!' });

    expect(JSON.stringify(result)).not.toContain(passwordHash);
    expect(JSON.stringify(result)).not.toContain('passwordHash');
  });
});
