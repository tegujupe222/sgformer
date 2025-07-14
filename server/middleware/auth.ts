import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// JWTトークン生成
export const generateToken = (user: {
  _id: string;
  email: string;
  role: string;
}) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 認証ミドルウェア
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // JWTトークンの検証
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // ユーザーの存在確認
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: user._id?.toString() || '',
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// 管理者権限チェックミドルウェア
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
