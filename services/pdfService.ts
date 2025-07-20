import type { Submission, EventForm } from '../types';

declare const jsPDF: {
  jsPDF: new () => {
    setFontSize: (size: number) => void;
    setFont: (font: string, style: string) => void;
    text: (
      text: string,
      x: number,
      y: number,
      options?: { align?: string }
    ) => void;
    setLineWidth: (width: number) => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    addImage: (
      data: string,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number
    ) => void;
    save: (filename: string) => void;
  };
};

declare const JsBarcode: (
  canvas: HTMLCanvasElement,
  data: string,
  options: {
    format: string;
    displayValue: boolean;
    width: number;
    height: number;
    margin: number;
  }
) => void;

export const generateTicketPDF = (submission: Submission, form: EventForm) => {
  const { jsPDF: JSPDF } = jsPDF;
  const doc = new JSPDF();

  const formOption = form.options?.find(
    opt => opt.id === submission.selectedOptionId
  );

  // --- Header ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SGformer Event Ticket', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Reception Confirmation', 105, 30, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // --- Event Details ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Event:', 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(form.title, 50, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Session:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(formOption ? formOption.label : 'N/A', 50, 60);

  // --- Attendee Details ---
  doc.setFont('helvetica', 'bold');
  doc.text('Attendee:', 20, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(submission.userName, 50, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 20, 90);
  doc.setFont('helvetica', 'normal');
  doc.text(submission.userEmail, 50, 90);

  doc.setFont('helvetica', 'bold');
  doc.text('Submission ID:', 20, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(submission.id, 50, 100);

  doc.setLineWidth(0.2);
  doc.line(20, 110, 190, 110);

  // --- Barcode ---
  const barcodeCanvas = document.createElement('canvas');
  try {
    const barcodeData = JSON.stringify({
      submissionId: submission.id,
      formId: submission.formId,
      userId: submission.userId,
    });
    JsBarcode(barcodeCanvas, barcodeData, {
      format: 'CODE128',
      displayValue: false,
      width: 2,
      height: 50,
      margin: 10,
    });
    doc.addImage(barcodeCanvas.toDataURL('image/png'), 'PNG', 55, 120, 100, 30);
    doc.setFontSize(10);
    doc.text('Please present this ticket at the reception desk.', 105, 160, {
      align: 'center',
    });
  } catch (_e) {
    doc.text('Barcode generation failed.', 105, 135, { align: 'center' });
  }

  // --- Footer ---
  doc.line(20, 270, 190, 270);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 275, {
    align: 'center',
  });

  doc.save(`SGformer-Ticket-${submission.id}.pdf`);
};
