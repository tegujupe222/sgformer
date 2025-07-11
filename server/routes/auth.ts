import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google認証でログイン
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Googleトークンの検証
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // ユーザーの存在確認または作成
    let user = await User.findOne({ googleId });

    if (!user) {
      // 新規ユーザー作成
      user = new User({
        googleId,
        email: email || '',
        name: name || '',
        picture: picture || undefined,
        role: 'user', // デフォルトは一般ユーザー
        lastLoginAt: new Date()
      });
      await user.save();
    } else {
      // 既存ユーザーの最終ログイン日時を更新
      user.lastLoginAt = new Date();
      user.name = name || user.name; // 名前が変更されている可能性があるため更新
      user.picture = picture || user.picture; // プロフィール画像も更新
      await user.save();
    }

    // レスポンス
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// ユーザー情報取得
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Googleトークンの検証
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ユーザー情報取得
    const user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Failed to get user information' });
  }
});

// ログアウト（クライアントサイドでトークンを削除するため、サーバーサイドでは特別な処理は不要）
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// 管理者権限の確認
router.get('/admin-check', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findOne({ googleId: payload.sub });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    res.json({ isAdmin: true });

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Failed to check admin status' });
  }
});

export default router; 