import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import { ArrowLeftIcon } from '../ui/Icons';
import { submissionsApi } from '../../services/api';

const EventForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { user, getFormById, getSubmissionsByFormId, addSubmission } = useApp();
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [error, setError] = useState('');

  if (!formId) return <PageWrapper title="Error">Form not found.</PageWrapper>;

  const form = getFormById(formId);
  const submissions = getSubmissionsByFormId(formId);

  if (!form) return <PageWrapper title="Error">Form not found.</PageWrapper>;

  const getSubmissionsForOption = (optionId: string) => {
    return submissions.filter(s => s.selectedOptionId === optionId).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId) {
      setError('Please select an option to register.');
      return;
    }
    setError('');

    // Form data prepared for submission

    try {
      const newSubmission = {
        formId: form.id,
        userId: user!.id,
        userName: user!.name,
        userEmail: user!.email,
        selectedOptionId,
        answers: [], // 空のanswers配列を追加
        attended: false,
      };

      const result = await submissionsApi.createSubmission(newSubmission);
      addSubmission(result);
      navigate(`/user/confirmation/${result.id}`);
    } catch {
      // Form submission error handled
      setError('フォーム送信に失敗しました');
    }
  };

  const actions = (
    <button
      onClick={() => navigate('/user/dashboard')}
      className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
    >
      <ArrowLeftIcon className="w-4 h-4 mr-2" />
      Back to Events
    </button>
  );

  return (
    <PageWrapper title={form.title} actions={actions}>
      <p className="text-gray-600 mb-6">{form.description}</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Choose your session:
          </h3>
          <div className="mt-4 space-y-3">
            {form.options?.map(option => {
              const submissionCount = getSubmissionsForOption(option.id);
              const isFull = submissionCount >= option.limit;
              const isSelected = selectedOptionId === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => !isFull && setSelectedOptionId(option.id)}
                  className={`p-4 border rounded-lg transition-all ${
                    isFull
                      ? 'bg-gray-200 opacity-70 cursor-not-allowed'
                      : 'cursor-pointer hover:border-brand-primary'
                  } ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={option.id}
                      className="font-medium text-brand-dark"
                    >
                      {option.label}
                    </label>
                    <span
                      className={`text-sm font-semibold ${isFull ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      {isFull
                        ? 'Full'
                        : `${submissionCount} / ${option.limit} registered`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="pt-5">
          <button
            type="submit"
            disabled={!selectedOptionId}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Submit Registration
          </button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default EventForm;
