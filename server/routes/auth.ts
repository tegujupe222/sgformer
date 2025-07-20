import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

// Google認証でログイン
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Google IDトークンを検証
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GoogleUser;
    if (!payload) {
      return res.status(401).json({ error: 'Invalid ID token' });
    }

    // ユーザーを検索または作成
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        profilePicture: payload.picture,
        role: 'user',
      });
      await user.save();
    }

    // JWTトークンを生成
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ユーザー情報取得（認証済みユーザーのみ）
router.get('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-googleId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ログアウト
router.post(
  '/logout',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // クライアント側でトークンを削除するため、サーバー側では特に何もしない
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
);

// 管理者権限の確認（認証済みユーザーのみ）
router.get(
  '/admin-check',
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const user = await User.findById(req.user?.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      res.json({ isAdmin: true });
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ error: 'Admin check failed' });
    }
  }
);

// デモ用ログイン（開発環境のみ）
router.post('/demo', async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    
    if (!type || !['user', 'admin'].includes(type)) {
      return res.status(400).json({ error: 'Invalid demo type' });
    }

    // デモ用ユーザーデータ
    const demoUsers = {
      user: {
        _id: 'demo-user-id',
        email: 'igafactory2023@gmail.com',
        name: 'Factory2023',
        role: 'user',
        profilePicture: 'https://lh3.googleusercontent.com/a/default-user',
      },
      admin: {
        _id: 'demo-admin-id',
        email: 'admin@sgformer.com',
        name: 'SGformer Admin',
        role: 'admin',
        profilePicture: 'https://lh3.googleusercontent.com/a/default-user',
      },
    };

    const user = demoUsers[type as keyof typeof demoUsers];
    
    // JWTトークンを生成
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

export default router;
