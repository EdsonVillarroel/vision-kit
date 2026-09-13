import React from 'react';
import { Card } from '../../../components/ui/Card';
import { LoginForm } from './LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-theme-light-primary/20 to-theme-light-primary/50 relative overflow-hidden">
      {/* Background decoration — soft, estático */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-theme-primary/15 blur-[110px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-theme-accent/15 blur-[110px]" />
      </div>

      <div className="w-full max-w-md px-4 z-10 animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-dark-primary mb-2 tracking-tight">Bienvenido</h1>
          <p className="text-theme-secondary-text">Inicia sesión para acceder al panel</p>
        </div>

        <Card>
          <LoginForm />
        </Card>

        <p className="text-center mt-8 text-theme-secondary-text/60 text-sm">
          &copy; {new Date().getFullYear()} Vision Kit. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
