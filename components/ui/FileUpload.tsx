import React, { useState, useRef } from 'react';
import { uploadApi, UploadedFile } from '../../services/uploadApi';
import { UploadIcon, XIcon, FileIcon } from '../ui/Icons';

interface FileUploadProps {
  onFileUpload: (_file: UploadedFile) => void;
  onFileRemove?: (_filename: string) => void;
  uploadedFiles?: UploadedFile[];
  maxSize?: number; // MB
  accept?: string;
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFiles = [],
  multiple = false,
  accept = '*/*',
  maxSize = 10,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);

      // ファイルサイズチェック
      const oversizedFiles = fileArray.filter(
        file => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        throw new Error(
          `ファイルサイズが大きすぎます。最大${maxSize}MBまでです。`
        );
      }

      // ファイルタイプチェック
      if (accept !== '*/*') {
        const allowedTypes = accept.split(',').map(type => type.trim());
        const invalidFiles = fileArray.filter(file => {
          return !allowedTypes.some(type => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            return file.type.match(new RegExp(type.replace('*', '.*')));
          });
        });

        if (invalidFiles.length > 0) {
          throw new Error('許可されていないファイル形式です。');
        }
      }

      if (multiple) {
        const uploadedFiles = await uploadApi.uploadMultiple(fileArray);
        uploadedFiles.forEach(file => onFileUpload(file));
      } else {
        const uploadedFile = await uploadApi.uploadSingle(fileArray[0]);
        onFileUpload(uploadedFile);
      }
    } catch (error) {
      // File upload error handled
      setError(
        error instanceof Error
          ? error.message
          : 'ファイルのアップロードに失敗しました。'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet'))
      return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation'))
      return '📽️';
    return '📁';
  };

  // File removal handled by parent component

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ファイルアップロードエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-gray-300 hover:border-brand-primary hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isUploading
              ? 'アップロード中...'
              : 'ファイルをドラッグ&ドロップまたはクリック'}
          </p>
          <p className="text-sm text-gray-500">
            最大{maxSize}MBまで、
            {accept === '*/*' ? 'すべてのファイル形式' : accept}をサポート
          </p>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* アップロード済みファイル一覧 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">
            アップロード済みファイル
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, _index) => (
              <div
                key={file.filename}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                  <div>
                    <p className="font-medium text-gray-700">
                      {file.originalname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    download={file.originalname}
                    className="p-1 text-gray-400 hover:text-brand-primary transition-colors"
                    title="ダウンロード"
                  >
                    <FileIcon className="w-4 h-4" />
                  </a>

                  {onFileRemove && (
                    <button
                      onClick={() => onFileRemove(file.filename)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="削除"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
