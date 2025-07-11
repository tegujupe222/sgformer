
import type { Submission } from '../types';

export const exportSubmissionsToCSV = (submissions: Submission[], formTitle: string) => {
  if (submissions.length === 0) {
    alert("No submissions to export.");
    return;
  }

  const headers = ['Submission ID', 'User Name', 'User Email', 'Selected Option ID', 'Submitted At', 'Attended'];
  const rows = submissions.map(sub => [
    sub.id,
    sub.userName,
    sub.userEmail,
    sub.selectedOptionId,
    new Date(sub.submittedAt).toLocaleString(),
    sub.attended ? 'Yes' : 'No'
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = `submissions-${formTitle.replace(/ /g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
