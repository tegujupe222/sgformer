
import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogoutIcon } from '../ui/Icons';
import { useTranslation } from '../../utils/i18n';

const Header: React.FC = () => {
  const { user, logout } = useApp();
  const { auth, dashboard } = useTranslation();

  return (
    <header className="bg-brand-primary shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">
          <span className="font-light">SG</span>former
        </h1>
        <div className="flex items-center">
          <span className="text-white mr-4 hidden sm:inline">{dashboard('welcome')}, {user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 bg-brand-secondary text-white text-sm font-medium rounded-md hover:bg-brand-accent transition-colors"
            aria-label="Logout"
          >
            <LogoutIcon className="w-5 h-5 mr-1" />
            {auth('logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
