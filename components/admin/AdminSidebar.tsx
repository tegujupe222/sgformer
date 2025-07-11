import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../utils/i18n';
import { UsersIcon, PlusIcon, DownloadIcon, BarcodeIcon, ChevronRightIcon } from '../ui/Icons';

const AdminSidebar: React.FC = () => {
  const { admin, navigation } = useTranslation();
  const menu = [
    {
      label: navigation('dashboard'),
      to: '/admin/dashboard',
      icon: <ChevronRightIcon className="w-5 h-5 mr-2" />,
    },
    {
      label: admin('formManagement'),
      to: '/admin/create',
      icon: <PlusIcon className="w-5 h-5 mr-2" />,
    },
    {
      label: admin('submissionManagement'),
      to: '/admin/dashboard', // 仮: 提出物管理ページがあれば差し替え
      icon: <DownloadIcon className="w-5 h-5 mr-2" />,
    },
    {
      label: admin('userManagement'),
      to: '/admin/dashboard', // 仮: ユーザー管理ページがあれば差し替え
      icon: <UsersIcon className="w-5 h-5 mr-2" />,
    },
    {
      label: admin('systemSettings'),
      to: '/admin/dashboard', // 仮: システム設定ページがあれば差し替え
      icon: <BarcodeIcon className="w-5 h-5 mr-2" />,
    },
  ];

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 py-8 px-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        {menu.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
            end
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar; 