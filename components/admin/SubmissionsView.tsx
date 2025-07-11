
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import { exportSubmissionsToCSV } from '../../utils/csvExporter';
import { DownloadIcon, ArrowLeftIcon, CheckCircleIcon } from '../ui/Icons';
import { getSubmissions, updateSubmission, FormSubmission } from '../../services/api';

const SubmissionsView: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getFormById, getSubmissionsByFormId } = useApp();

  if (!formId) return <PageWrapper title="Error">Form not found.</PageWrapper>;
  
  const form = getFormById(formId);
  const submissions = getSubmissionsByFormId(formId);

  if (!form) return <PageWrapper title="Error">Form not found.</PageWrapper>;

  const handleExport = () => {
    exportSubmissionsToCSV(submissions, form.title);
  };
  
  const actions = (
      <>
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <button onClick={handleExport} className="flex items-center px-4 py-2 text-sm bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export to CSV
        </button>
      </>
  );

  return (
    <PageWrapper title={`Submissions for "${form.title}"`} actions={actions}>
        <p className="text-gray-600 mb-6">{form.description}</p>
        {submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No submissions have been received for this form yet.</p>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Selected Option</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Submitted At</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Attended</th>
                </tr>
                </thead>
                <tbody className="text-gray-700">
                {submissions.map(sub => {
                    const option = form.options?.find(opt => opt.id === sub.selectedOptionId);
                    return (
                        <tr key={sub.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{sub.userName}</td>
                        <td className="py-3 px-4">{sub.userEmail}</td>
                        <td className="py-3 px-4">{option?.label || 'N/A'}</td>
                        <td className="py-3 px-4">{new Date(sub.submittedAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                            {sub.attended ? (
                                <CheckCircleIcon className="w-6 h-6 text-green-500 inline-block" />
                            ) : (
                                <span className="text-gray-400">-</span>
                            )}
                        </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        )}
    </PageWrapper>
  );
};

export default SubmissionsView;
