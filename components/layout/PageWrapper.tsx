
import React from 'react';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children, actions }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-brand-dark">{title}</h2>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
