import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

const DEMO_USERS = [
  { email: 'admin@visionkit.com', role: 'Admin', color: 'red' },
  { email: 'gerente@visionkit.com', role: 'Gerente', color: 'blue' },
  { email: 'optico1@visionkit.com', role: 'Óptico 1', color: 'green' },
  { email: 'optico2@visionkit.com', role: 'Óptico 2', color: 'green' }
];

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('admin@visionkit.com');
  const [password, setPassword] = useState('123456');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      // Error is handled by auth context
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={validationError && !email ? 'Email is required' : undefined}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          error={validationError && !password ? 'Password is required' : undefined}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-fadeIn">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Iniciar Sesión
      </Button>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          Credenciales de Demostración
        </h3>
        <div className="space-y-2">
          {DEMO_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword('123456');
              }}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                email === user.email
                  ? 'bg-white border-blue-300 shadow-sm'
                  : 'bg-white/50 border-transparent hover:bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.role}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user.color === 'red' ? 'bg-red-100 text-red-800' :
                  user.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-600 text-center">
          Contraseña para todos: <span className="font-mono font-semibold">123456</span>
        </p>
      </div>
    </form>
  );
};
