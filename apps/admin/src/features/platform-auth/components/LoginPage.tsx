import React from 'react';
import { Card } from '../../../components/ui/Card';
import { LoginForm } from './LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-theme-light-primary/20 to-theme-light-primary/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-theme-primary/20 blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-theme-accent/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-theme-primary to-theme-dark-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl mx-auto mb-4">
            VK
          </div>
          <h1 className="text-4xl font-bold text-theme-dark-primary mb-2 tracking-tight">Vision Kit</h1>
          <p className="text-theme-secondary-text">Panel de Administración de Plataforma</p>
        </div>

        <Card>
          <LoginForm />
        </Card>

        <p className="text-center mt-8 text-theme-secondary-text/60 text-sm">
          &copy; {new Date().getFullYear()} Vision Kit. Acceso restringido.
        </p>
      </div>
    </div>
  );
};
