import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWTトークン生成
export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 認証ミドルウェア
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // JWTトークンの検証
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // ユーザーの存在確認
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// 管理者権限チェックミドルウェア
export const requireAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}; 