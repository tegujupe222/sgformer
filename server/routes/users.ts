import express from 'express';
import User from '../models/User';
import Form from '../models/Form';
import Submission from '../models/Submission';

const router = express.Router();

// ユーザー一覧取得（管理者用）
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 検索条件の構築
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const users = await User.find(filter)
      .select('-googleId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    // 各ユーザーの統計情報を取得
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const formCount = await Form.countDocuments({ createdBy: user._id });
        const submissionCount = await Submission.countDocuments({ userId: user._id });
        
        return {
          ...user,
          formCount,
          submissionCount
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// ユーザー詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-googleId')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ユーザーの統計情報を取得
    const formCount = await Form.countDocuments({ createdBy: id });
    const submissionCount = await Submission.countDocuments({ userId: id });
    
    // 最近作成したフォーム
    const recentForms = await Form.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .lean();

    // 最近の提出物
    const recentSubmissions = await Submission.find({ userId: id })
      .populate('formId', 'title')
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('formId submittedAt attended')
      .lean();

    res.json({
      ...user,
      formCount,
      submissionCount,
      recentForms,
      recentSubmissions
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// ユーザー権限更新
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 自分自身の権限を変更できないようにする
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// ユーザーアカウントの有効/無効切り替え
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 自分自身のアカウントを無効化できないようにする
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// ユーザー削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 自分自身を削除できないようにする
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // ユーザーが作成したフォームを削除
    await Form.deleteMany({ createdBy: id });
    
    // ユーザーの提出物を削除
    await Submission.deleteMany({ userId: id });
    
    // ユーザーを削除
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// システム統計情報取得
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    const totalForms = await Form.countDocuments();
    const activeForms = await Form.countDocuments({ 'settings.isActive': true });
    
    const totalSubmissions = await Submission.countDocuments();
    const attendedSubmissions = await Submission.countDocuments({ attended: true });

    // 最近の登録ユーザー
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')
      .lean();

    // 最近作成されたフォーム
    const recentForms = await Form.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdBy createdAt')
      .lean();

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admin: adminUsers
      },
      forms: {
        total: totalForms,
        active: activeForms
      },
      submissions: {
        total: totalSubmissions,
        attended: attendedSubmissions,
        attendanceRate: totalSubmissions > 0 ? (attendedSubmissions / totalSubmissions) * 100 : 0
      },
      recentUsers,
      recentForms
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Failed to get system statistics' });
  }
});

export default router; 