import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// ミドルウェアのインポート
import { authenticateToken, requireAdmin } from './middleware/auth';

// ルーターのインポート
import authRoutes from './routes/auth';
import formRoutes from './routes/forms';
import submissionRoutes from './routes/submissions';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB接続
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sgformer')
  .then(() => {
    // MongoDB connected
  })
  .catch(_err => {
    // MongoDB connection error
  });

// ミドルウェア
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/forms', authenticateToken, formRoutes);
app.use('/api/submissions', authenticateToken, submissionRoutes);
app.use('/api/users', authenticateToken, requireAdmin, userRoutes);
app.use('/api/upload', uploadRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// エラーハンドリング
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Error stack logged
    res.status(500).json({ message: 'Something went wrong!' });
    next();
  }
);

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  // Server running on port ${PORT}
});

export default app;
