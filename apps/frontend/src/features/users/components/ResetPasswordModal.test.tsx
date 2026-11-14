import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordModal } from './ResetPasswordModal';

const setup = (userName: string | null = 'María García') => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ResetPasswordModal userName={userName} onConfirm={onConfirm} onCancel={onCancel} />);
  return { onConfirm, onCancel, user: userEvent.setup() };
};

describe('ResetPasswordModal', () => {
  it('no se muestra sin usuario seleccionado', () => {
    setup(null);
    expect(screen.queryByText('Restablecer contraseña')).not.toBeInTheDocument();
  });

  it('propone una contraseña generada de 8 caracteres sin ambiguos', () => {
    setup();
    const value = (screen.getByLabelText('Nueva contraseña') as HTMLInputElement).value;
    expect(value).toMatch(/^[a-km-zA-HJ-NP-Z2-9]{8}$/);
    expect(screen.getByText('María García')).toBeInTheDocument();
  });

  it('"Generar" cambia la contraseña', async () => {
    const { user } = setup();
    const input = screen.getByLabelText('Nueva contraseña') as HTMLInputElement;
    const before = input.value;
    await user.click(screen.getByRole('button', { name: 'Generar' }));
    expect(input.value).not.toBe(before);
  });

  it('bloquea contraseñas de menos de 6 caracteres', async () => {
    const { user, onConfirm } = setup();
    const input = screen.getByLabelText('Nueva contraseña');
    await user.clear(input);
    await user.type(input, 'abc');

    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restablecer' })).toBeDisabled();
    await user.type(input, '{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirma con la contraseña escrita', async () => {
    const { user, onConfirm } = setup();
    const input = screen.getByLabelText('Nueva contraseña');
    await user.clear(input);
    await user.type(input, 'clave789');
    await user.click(screen.getByRole('button', { name: 'Restablecer' }));
    expect(onConfirm).toHaveBeenCalledWith('clave789');
  });

  it('Cancelar llama a onCancel', async () => {
    const { user, onCancel } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
