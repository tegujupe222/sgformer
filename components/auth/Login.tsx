
import React from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleIcon } from '../ui/Icons';
import { useTranslation } from '../../utils/i18n';

const Login: React.FC = () => {
  const { login } = useApp();
  const { auth, app } = useTranslation();

  const handleLogin = (role: 'admin' | 'user') => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-bold text-brand-dark mb-2">
          <span className="font-light">SG</span>former
        </h1>
        <p className="text-gray-500 mb-8">{app('tagline')}</p>
        
        <div className="space-y-4">
            <button
            onClick={() => handleLogin('user')}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 transform hover:translate-y-[-2px]"
            >
            <GoogleIcon className="w-5 h-5 mr-3" />
            {auth('signInAsUser')}
            </button>

            <button
            onClick={() => handleLogin('admin')}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 transform hover:translate-y-[-2px]"
            >
            <GoogleIcon className="w-5 h-5 mr-3" />
            {auth('signInAsAdmin')}
            </button>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          {auth('demoMessage')}
        </p>
      </div>
    </div>
  );
};

export default Login;
