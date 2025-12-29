import React from 'react';
import { Card } from '../../../components/ui/Card';
import { LoginForm } from './LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500">Sign in to access your dashboard</p>
        </div>
        
        <Card>
          <LoginForm />
        </Card>
        
        <p className="text-center mt-8 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Vision Kit. All rights reserved.
        </p>
      </div>
    </div>
  );
};
