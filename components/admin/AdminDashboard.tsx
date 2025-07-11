
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import { PlusIcon, UsersIcon, BarcodeIcon, ChevronRightIcon, TrashIcon } from '../ui/Icons';
import { useTranslation } from '../../utils/i18n';
import AdminSidebar from './AdminSidebar';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { forms, getSubmissionsByFormId, deleteForm } = useApp();
  const { admin, forms: formsT, messages, common, dashboard, submissions: submissionsT } = useTranslation();

  const handleCreateForm = () => {
    navigate('/admin/create');
  };
  
  const handleDelete = (formId: string, formTitle: string) => {
    if (window.confirm(`${formsT('confirmDelete')} "${formTitle}" ${messages('deleteWarning')}`)) {
      deleteForm(formId);
    }
  };

  const actions = (
    <button
      onClick={handleCreateForm}
      className="flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-75 transition-all"
    >
      <PlusIcon className="w-5 h-5 mr-2" />
      {admin('createNewForm')}
    </button>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <PageWrapper title={admin('adminDashboard')} actions={actions}>
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700">{dashboard('noForms')}</h3>
              <p className="text-gray-500 mt-2">{admin('createNewForm')}をクリックして開始してください。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map(form => {
                const submissions = getSubmissionsByFormId(form.id);
                const totalCapacity = form.options?.reduce((sum: number, opt: any) => sum + opt.limit, 0) || 0;
                const submissionCount = submissions.length;
                const progress = totalCapacity > 0 ? (submissionCount / totalCapacity) * 100 : 0;
                return (
                  <div key={form.id} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md hover:border-brand-accent">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                      <div>
                        <h3 className="text-lg font-bold text-brand-dark">{form.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-3">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          <span>{submissionCount} / {totalCapacity} {submissionsT('submissionId')}</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full ml-4 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <button onClick={() => handleDelete(form.id, form.title)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                        <button onClick={() => navigate(`/admin/form/${form.id}/checkin`)} className="px-3 py-2 text-sm font-medium text-brand-secondary bg-blue-100 rounded-md hover:bg-blue-200 transition-colors flex items-center">
                          <BarcodeIcon className="w-4 h-4 mr-1" />
                          {submissionsT('checkIn')}
                        </button>
                        <button onClick={() => navigate(`/admin/form/${form.id}`)} className="px-3 py-2 text-sm font-medium text-white bg-brand-secondary rounded-md hover:bg-brand-primary transition-colors flex items-center">
                          {common('view')} {common('details')} <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageWrapper>
      </div>
    </div>
  );
};

export default AdminDashboard;
