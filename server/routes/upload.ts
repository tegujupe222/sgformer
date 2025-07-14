import express from 'express';
import path from 'path';
import {
  handleUpload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
} from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 単一ファイルアップロード
router.post(
  '/single',
  authenticateToken,
  handleUpload(uploadSingle),
  (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: `/api/upload/files/${req.file.filename}`,
        },
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  }
);

// 複数ファイルアップロード
router.post(
  '/multiple',
  authenticateToken,
  handleUpload(uploadMultiple),
  (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const files = req.files.map((file: any) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/upload/files/${file.filename}`,
      }));

      res.json({
        message: 'Files uploaded successfully',
        files,
      });
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  }
);

// ファイルダウンロード
router.get('/files/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    res.download(filePath, err => {
      if (err) {
        console.error('File download error:', err);
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// ファイル削除
router.delete('/files/:filename', authenticateToken, (req: any, res) => {
  try {
    const { filename } = req.params;

    // ファイルの存在確認
    const filePath = path.join(__dirname, '../uploads', filename);
    const fs = require('fs');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // ファイル削除
    deleteFile(filename);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// アップロードされたファイル一覧取得
router.get('/files', authenticateToken, (req: any, res) => {
  try {
    const fs = require('fs');
    const uploadDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((file: string) => {
        const filePath = path.join(uploadDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map((file: string) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          url: `/api/upload/files/${file}`,
        };
      })
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Failed to get files' });
  }
});

export default router;
