
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import { ChevronRightIcon } from '../ui/Icons';
import { useTranslation } from '../../utils/i18n';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { forms, getSubmissionsByFormId } = useApp();
  const { user, dashboard } = useTranslation();

  return (
    <PageWrapper title={user('availableEvents')}>
      {forms.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">現在利用可能なイベントはありません。</h3>
          <p className="text-gray-500 mt-2">後でもう一度ご確認ください。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map(form => {
            const submissions = getSubmissionsByFormId(form.id);
            const totalCapacity = form.options.reduce((sum, opt) => sum + opt.limit, 0);
            const isFull = submissions.length >= totalCapacity;

            return (
              <div
                key={form.id}
                className={`bg-white rounded-lg shadow-md border p-5 transition-all duration-300 ${
                  isFull ? 'opacity-60 bg-gray-100' : 'hover:shadow-xl hover:border-brand-accent cursor-pointer'
                }`}
                onClick={() => !isFull && navigate(`/user/form/${form.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary">{form.title}</h3>
                    <p className="text-gray-600 mt-2">{form.description}</p>
                  </div>
                  <div className="text-right">
                    {isFull ? (
                      <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
                        満員
                      </span>
                    ) : (
                      <div className="flex items-center text-brand-secondary">
                        <span className="font-semibold">{user('registerForEvent')}</span>
                        <ChevronRightIcon className="w-6 h-6 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};

export default UserDashboard;
