import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

describe('UsersService.resetPassword', () => {
  const build = (target: { id: string; role: string } | null) => {
    const client = {
      user: {
        findFirst: jest.fn(async () => target),
        update: jest.fn(async (_args: { where: { id: string }; data: { passwordHash: string } }) => ({})),
      },
    };
    return { client, service: new UsersService({ client } as never) };
  };

  const admin = { id: 'admin-1', role: 'admin' };

  it('el admin restablece la contraseña de un óptico sin pedir la actual', async () => {
    const { client, service } = build({ id: 'opt-1', role: 'optician' });

    const res = await service.resetPassword('opt-1', 'nueva123', admin);

    expect(res.message).toMatch(/restablecida/);
    const { where, data } = client.user.update.mock.calls[0][0];
    expect(where.id).toBe('opt-1');
    expect(await bcrypt.compare('nueva123', data.passwordHash)).toBe(true);
    expect(JSON.stringify(res)).not.toContain('passwordHash');
  });

  it('no permite restablecer la propia cuenta', async () => {
    const { client, service } = build({ id: 'admin-1', role: 'admin' });

    await expect(service.resetPassword('admin-1', 'nueva123', admin)).rejects.toBeInstanceOf(ForbiddenException);
    expect(client.user.update).not.toHaveBeenCalled();
  });

  it('un admin no puede restablecer la contraseña del super_admin', async () => {
    const { client, service } = build({ id: 'sa-1', role: 'super_admin' });

    await expect(service.resetPassword('sa-1', 'nueva123', admin)).rejects.toBeInstanceOf(ForbiddenException);
    expect(client.user.update).not.toHaveBeenCalled();
  });

  it('el super_admin puede restablecer a un admin', async () => {
    const { client, service } = build({ id: 'admin-1', role: 'admin' });

    await service.resetPassword('admin-1', 'nueva123', { id: 'sa-1', role: 'super_admin' });
    expect(client.user.update).toHaveBeenCalledTimes(1);
  });

  it('404 si el usuario no existe en el tenant', async () => {
    const { service } = build(null);

    await expect(service.resetPassword('x', 'nueva123', admin)).rejects.toBeInstanceOf(NotFoundException);
  });
});
