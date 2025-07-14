import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// アップロードディレクトリの作成
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ストレージ設定
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: any, cb: any) => {
    // ファイル名の重複を避けるため、タイムスタンプを追加
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// ファイルフィルター
const fileFilter = (req: any, file: any, cb: any) => {
  // 許可するファイルタイプ
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only images, PDFs, Word documents, and text files are allowed.'
      )
    );
  }
};

// ファイルサイズ制限（10MB）
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// 単一ファイルアップロード
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits,
}).single('file');

// 複数ファイルアップロード
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits,
}).array('files', 5); // 最大5ファイル

// エラーハンドリング付きのミドルウェア
export const handleUpload = (uploadMiddleware: any) => {
  return (req: any, res: any, next: any) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err && err.code) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res
            .status(400)
            .json({ message: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

// ファイル削除用のユーティリティ関数
export const deleteFile = (filename: string) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
