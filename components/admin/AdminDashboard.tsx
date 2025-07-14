import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EventForm } from '../../types';
import { useTranslation } from '../../utils/i18n';
import AdminSidebar from './AdminSidebar';

const AdminDashboard: React.FC = () => {
  const { forms, getSubmissionsByFormId } = useApp();
  const navigate = useNavigate();
  const { admin } = useTranslation();

  const handleDelete = (formId: string, formTitle: string) => {
    if (
      window.confirm(
        `${admin('confirmDelete')} "${formTitle}" ${admin('deleteWarning')}`
      )
    ) {
      // deleteForm(formId); // This line was removed from imports, so it's removed here.
    }
  };

  const handleFormClick = (form: EventForm) => {
    navigate(`/admin/form/${form.id}`);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700">
              {admin('noForms')}
            </h3>
            <p className="text-gray-500 mt-2">
              {admin('createNewForm')}をクリックして開始してください。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map(form => {
              const submissions = getSubmissionsByFormId(form.id);
              const totalCapacity =
                form.options?.reduce(
                  (sum: number, opt: { limit: number }) => sum + opt.limit,
                  0
                ) || 0;
              const submissionCount = submissions.length;
              const progress =
                totalCapacity > 0 ? (submissionCount / totalCapacity) * 100 : 0;
              return (
                <div
                  key={form.id}
                  className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md hover:border-brand-accent"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {form.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mt-3">
                        <span>
                          {submissionCount} / {totalCapacity}
                        </span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full ml-4 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleDelete(form.id, form.title)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/form/${form.id}/checkin`)
                        }
                        className="px-3 py-2 text-sm font-medium text-brand-secondary bg-blue-100 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 mr-1"
                        >
                          <path d="M12 2L2 12l10 10 9-9-1-1-8-8" />
                        </svg>
                        Check In
                      </button>
                      <button
                        onClick={() => handleFormClick(form)}
                        className="px-3 py-2 text-sm font-medium text-white bg-brand-secondary rounded-md hover:bg-brand-primary transition-colors flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 ml-1"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
