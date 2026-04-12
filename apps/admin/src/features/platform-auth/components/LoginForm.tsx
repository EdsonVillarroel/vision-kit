import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { usePlatformAuth } from '../hooks/usePlatformAuth';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = usePlatformAuth();
  const [email, setEmail] = useState('platform@visionkit.com');
  const [password, setPassword] = useState('123456');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Completa todos los campos');
      return;
    }

    try {
      await login({ email, password });
    } catch {
      // Error manejado por el contexto
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="admin@visionkit.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={validationError && !email ? 'Email requerido' : undefined}
        />
        <Input
          id="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          error={validationError && !password ? 'Contraseña requerida' : undefined}
        />
      </div>

      {(error ?? validationError) && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-fadeIn">
          {error ?? validationError}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Acceder al Panel
      </Button>

      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 text-center">
        <span className="font-semibold">Demo:</span> platform@visionkit.com / 123456
      </div>
    </form>
  );
};
