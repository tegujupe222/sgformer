
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import type { Submission } from '../../types';
import { ArrowLeftIcon, CheckCircleIcon, BarcodeIcon } from '../ui/Icons';

const CheckIn: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { getFormById, getSubmissionsByFormId, updateSubmission } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScanned, setLastScanned] = useState<Submission | null>(null);
  const [error, setError] = useState('');
  const [attendedList, setAttendedList] = useState<Submission[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = formId ? getFormById(formId) : undefined;
  const submissions = formId ? getSubmissionsByFormId(formId) : [];

  useEffect(() => {
    const currentAttended = submissions
      .filter(s => s.attended)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setAttendedList(currentAttended);
    inputRef.current?.focus();
  }, [submissions]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLastScanned(null);

    try {
      const parsedData = JSON.parse(barcodeInput);
      if (parsedData.submissionId && parsedData.formId) {
        if (parsedData.formId !== formId) {
          setError('This ticket is for a different event.');
          setBarcodeInput('');
          return;
        }

        const submission = submissions.find(s => s.id === parsedData.submissionId);

        if (submission) {
          if (submission.attended) {
            setError(`This person (${submission.userName}) has already checked in.`);
          } else {
            const updatedSubmission = { ...submission, attended: true };
            updateSubmission(updatedSubmission);
            setLastScanned(updatedSubmission);
          }
        } else {
          setError('Invalid ticket. Submission not found.');
        }
      } else {
        setError('Invalid barcode data format.');
      }
    } catch (err) {
      setError('Could not read the barcode. Please try again.');
    }
    setBarcodeInput('');
    inputRef.current?.focus();
  };

  if (!form) return <PageWrapper title="Error">Form not found.</PageWrapper>;

  return (
    <PageWrapper title={`Check-in for: ${form.title}`} actions={<button onClick={() => navigate(`/admin/dashboard`)} className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"><ArrowLeftIcon className="w-4 h-4 mr-2" />Dashboard</button>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="font-bold text-lg mb-2">Scan Barcode</h3>
          <form onSubmit={handleScan}>
            <div className="relative">
              <BarcodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Ready to scan..."
                className="w-full pl-10 pr-4 py-3 text-lg border-2 border-brand-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                autoFocus
              />
            </div>
          </form>
          {error && <p className="text-red-600 mt-2 bg-red-100 p-3 rounded-lg">{error}</p>}
          {lastScanned && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg animate-fade-in">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="font-bold text-green-800">Check-in Success!</p>
                  <p className="text-green-700">{lastScanned.userName}</p>
                  <p className="text-sm text-green-600">{lastScanned.userEmail}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <h3 className="font-bold text-lg mb-2">Checked-in Attendees ({attendedList.length})</h3>
          <div className="bg-gray-50 border rounded-lg h-96 overflow-y-auto">
            {attendedList.length === 0 ? (
              <p className="text-center text-gray-500 p-8">No attendees have checked in yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {attendedList.map(sub => (
                  <li key={sub.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-brand-dark">{sub.userName}</p>
                      <p className="text-sm text-gray-500">{sub.userEmail}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CheckIn;
