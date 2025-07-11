
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { generateTicketPDF } from '../../services/pdfService';
import PageWrapper from '../layout/PageWrapper';
import { CheckCircleIcon, DownloadIcon } from '../ui/Icons';

const ConfirmationPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { getSubmissionById, getFormById } = useApp();

  if (!submissionId) return <PageWrapper title="Error">Invalid confirmation.</PageWrapper>;

  const submission = getSubmissionById(submissionId);

  if (!submission) return <PageWrapper title="Error">Submission not found.</PageWrapper>;
  
  const form = getFormById(submission.formId);
  
  if (!form) return <PageWrapper title="Error">Associated form not found.</PageWrapper>;

  const handleDownloadTicket = () => {
    generateTicketPDF(submission, form);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-brand-dark mb-2">Registration Confirmed!</h2>
            <p className="text-gray-600 mb-6">
                Thank you, {submission.userName}. Your registration for "{form.title}" has been successfully submitted.
            </p>
            <p className="text-sm text-gray-500 mb-8">
                A confirmation has been simulated as sent to your email at <span className="font-medium text-brand-secondary">{submission.userEmail}</span>.
                Please download and bring your ticket to the event for check-in.
            </p>
            <div className="space-y-4">
                <button
                    onClick={handleDownloadTicket}
                    className="w-full max-w-sm mx-auto flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-primary hover:bg-brand-secondary"
                >
                    <DownloadIcon className="w-6 h-6 mr-3" />
                    Download Your Ticket (PDF)
                </button>
                <button
                    onClick={() => navigate('/user/dashboard')}
                    className="w-full max-w-sm mx-auto py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                    Back to Events
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmationPage;
