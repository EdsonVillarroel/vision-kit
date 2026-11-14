import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

const ctxFor = (role?: string) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const build = (roles?: string[]) => {
    const reflector = { getAllAndOverride: jest.fn(() => roles) } as unknown as Reflector;
    return new RolesGuard(reflector);
  };

  it('pasa si el handler no declara roles', () => {
    expect(build(undefined).canActivate(ctxFor('optician'))).toBe(true);
  });

  it('pasa si el rol está en la lista', () => {
    expect(build(['admin', 'manager']).canActivate(ctxFor('manager'))).toBe(true);
  });

  it('bloquea si el rol no está en la lista', () => {
    expect(build(['admin', 'manager']).canActivate(ctxFor('optician'))).toBe(false);
  });

  it('super_admin pasa aunque no esté listado', () => {
    expect(build(['admin']).canActivate(ctxFor('super_admin'))).toBe(true);
  });

  it('bloquea sin usuario autenticado', () => {
    expect(build(['admin']).canActivate(ctxFor())).toBe(false);
  });
});
