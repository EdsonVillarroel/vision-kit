import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';

interface ResetPasswordModalProps {
  userName: string | null;
  isLoading?: boolean;
  onConfirm: (newPassword: string) => void;
  onCancel: () => void;
}

const MIN_LENGTH = 6;

// Sin caracteres ambiguos (0/O, 1/l/I) para que sea fácil dictarla en persona
const generatePassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ userName, isLoading = false, onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (userName) setPassword(generatePassword());
  }, [userName]);

  if (!userName) return null;

  const tooShort = password.length < MIN_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tooShort) onConfirm(password);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900">Restablecer contraseña</h3>
        <p className="text-sm text-gray-500 mt-1">
          Asigna una contraseña nueva a <span className="font-medium text-gray-700">{userName}</span>. No se pide la
          actual. Compártela con la persona y pídele que la cambie desde su perfil.
        </p>

        <label htmlFor="reset-password" className="block text-sm font-medium text-theme-primary-text mt-5 mb-1">
          Nueva contraseña
        </label>
        <div className="flex gap-2">
          <input
            id="reset-password"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 font-mono border border-theme-divider rounded-lg outline-none focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="px-3 py-2 text-sm font-medium text-theme-primary-text bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Generar
          </button>
        </div>
        {tooShort && <p className="text-xs text-red-600 mt-1">Mínimo {MIN_LENGTH} caracteres</p>}

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} className="w-auto px-5 py-2.5">
            Cancelar
          </Button>
          <Button type="submit" variant="warning" isLoading={isLoading} disabled={tooShort} className="w-auto px-5 py-2.5">
            Restablecer
          </Button>
        </div>
      </form>
    </div>
  );
};
