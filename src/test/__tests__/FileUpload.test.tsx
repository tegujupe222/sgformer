import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../../context/AppContext';
import FileUpload from '../../../components/ui/FileUpload';

describe('FileUpload Component', () => {
  const mockOnFileUpload = jest.fn();
  const mockOnFileRemove = jest.fn();

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AppProvider>{component}</AppProvider>
      </BrowserRouter>
    );
  };

  test('renders file upload component', () => {
    renderWithProviders(<FileUpload onFileUpload={mockOnFileUpload} />);
    expect(screen.getByText(/ファイルをアップロード/)).toBeInTheDocument();
  });

  test('handles file selection', async () => {
    renderWithProviders(<FileUpload onFileUpload={mockOnFileUpload} />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/ファイルを選択/);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  test('handles file upload', async () => {
    renderWithProviders(<FileUpload onFileUpload={mockOnFileUpload} />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/ファイルを選択/);

    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByText(/アップロード/);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/アップロード完了/)).toBeInTheDocument();
    });
  });

  test('handles multiple file selection', async () => {
    renderWithProviders(<FileUpload onFileUpload={mockOnFileUpload} />);

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/ファイルを選択/);

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });
  });

  test('handles file removal', async () => {
    renderWithProviders(
      <FileUpload
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/ファイルを選択/);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    const removeButton = screen.getByText(/削除/);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });
  });
});
