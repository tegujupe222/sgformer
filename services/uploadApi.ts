import { ApiError } from './api';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sgformer-token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ファイル情報の型定義
export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface FileInfo {
  filename: string;
  size: number;
  createdAt: string;
  url: string;
}

// ファイルアップロードAPI
export const uploadApi = {
  // 単一ファイルアップロード
  uploadSingle: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    return data.file;
  },

  // 複数ファイルアップロード
  uploadMultiple: async (files: File[]): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    return data.files;
  },

  // ファイル一覧取得
  getFiles: async (): Promise<FileInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/upload/files`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Failed to get files');
    }

    const data = await response.json();
    return data.files;
  },

  // ファイル削除
  deleteFile: async (filename: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/upload/files/${filename}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Failed to delete file');
    }
  },

  // ファイルダウンロードURL取得
  getDownloadUrl: (filename: string): string => {
    return `${API_BASE_URL}/upload/files/${filename}`;
  },
};
