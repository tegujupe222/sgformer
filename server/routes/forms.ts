import express from 'express';
import Form from '../models/Form';
import Submission from '../models/Submission';
import User from '../models/User';

const router = express.Router();

// フォーム一覧取得（管理者用）
router.get('/', async (req, res) => {
  try {
    // 開発環境ではデモデータを返す
    const demoForms = [
      {
        id: 'form-2024-info-session',
        title: '2024年度 学校説明会',
        description: '本校の教育理念、カリキュラム、進路実績について詳しくご説明いたします。',
        questions: [],
        options: [
          { id: 'session-am', label: '午前の部 (10:00-12:00)', limit: 50 },
          { id: 'session-pm', label: '午後の部 (14:00-16:00)', limit: 50 },
        ],
        settings: {
          allowAnonymous: false,
          requireLogin: true,
          maxSubmissions: 100,
          isActive: true,
        },
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        createdBy: 'admin001',
        submissionCount: 25,
      },
      {
        id: 'form-2024-trial-lesson',
        title: '2024年度 体験授業',
        description: '実際の授業を体験していただき、本校の学習環境を体感してください。',
        questions: [],
        options: [
          { id: 'math', label: '数学 (代数)', limit: 30 },
          { id: 'science', label: '理科 (物理)', limit: 30 },
          { id: 'english', label: '英語 (会話)', limit: 25 },
        ],
        settings: {
          allowAnonymous: false,
          requireLogin: true,
          maxSubmissions: 85,
          isActive: true,
        },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
        createdBy: 'admin001',
        submissionCount: 18,
      },
    ];

    res.json(demoForms);
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ message: 'Failed to get forms' });
  }
});

// 公開フォーム一覧取得（一般ユーザー用）
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const now = new Date();
    const forms = await Form.find({
      'settings.isActive': true,
      $and: [
        {
          $or: [
            { 'settings.startDate': { $lte: now } },
            { 'settings.startDate': { $exists: false } },
          ],
        },
        {
          $or: [
            { 'settings.endDate': { $gte: now } },
            { 'settings.endDate': { $exists: false } },
          ],
        },
      ],
    })
      .select('title description settings createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Form.countDocuments({
      'settings.isActive': true,
      $and: [
        {
          $or: [
            { 'settings.startDate': { $lte: now } },
            { 'settings.startDate': { $exists: false } },
          ],
        },
        {
          $or: [
            { 'settings.endDate': { $gte: now } },
            { 'settings.endDate': { $exists: false } },
          ],
        },
      ],
    });

    res.json({
      forms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get public forms error:', error);
    res.status(500).json({ message: 'Failed to get public forms' });
  }
});

// フォーム詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 提出数を取得
    const submissionCount = await Submission.countDocuments({ formId: id });

    res.json({
      ...form,
      submissionCount,
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Failed to get form' });
  }
});

// フォーム作成
router.post('/', async (req, res) => {
  try {
    const { title, description, questions, settings } = req.body;

    // バリデーション
    if (!title || !questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: 'Title and questions are required' });
    }

    const user = await User.findOne({ email: (req as any).user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const form = new Form({
      title,
      description,
      questions,
      settings: {
        allowAnonymous: settings?.allowAnonymous || false,
        requireLogin: settings?.requireLogin || true,
        maxSubmissions: settings?.maxSubmissions,
        startDate: settings?.startDate
          ? new Date(settings.startDate)
          : undefined,
        endDate: settings?.endDate ? new Date(settings.endDate) : undefined,
        isActive: settings?.isActive !== false,
      },
      createdBy: (user as any)._id,
    });

    await form.save();

    res.status(201).json({
      message: 'Form created successfully',
      form,
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ message: 'Failed to create form' });
  }
});

// フォーム更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions, settings } = req.body;

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: (req as any).user.email });
    if (!user || form.createdBy.toString() !== (user as any)._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 更新
    form.title = title || form.title;
    form.description = description || form.description;
    form.questions = questions || form.questions;

    if (settings) {
      form.settings = {
        ...form.settings,
        ...settings,
        startDate: settings.startDate
          ? new Date(settings.startDate)
          : form.settings.startDate,
        endDate: settings.endDate
          ? new Date(settings.endDate)
          : form.settings.endDate,
      };
    }

    await form.save();

    res.json({
      message: 'Form updated successfully',
      form,
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Failed to update form' });
  }
});

// フォーム削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: (req as any).user.email });
    if (!user || form.createdBy.toString() !== (user as any)._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 関連する提出物も削除
    await Submission.deleteMany({ formId: id });

    // フォーム削除
    await Form.findByIdAndDelete(id);

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ message: 'Failed to delete form' });
  }
});

// フォームの統計情報取得
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: (req as any).user.email });
    if (!user || form.createdBy.toString() !== (user as any)._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 統計情報を取得
    const totalSubmissions = await Submission.countDocuments({ formId: id });
    const attendedSubmissions = await Submission.countDocuments({
      formId: id,
      attended: true,
    });

    // 最近の提出物
    const recentSubmissions = await Submission.find({ formId: id })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('userName userEmail submittedAt attended')
      .lean();

    // 質問ごとの回答統計
    const questionStats = await Promise.all(
      form.questions.map(async question => {
        if (
          ['select', 'radio', 'checkbox'].includes(question.type) &&
          question.options
        ) {
          const optionStats = await Promise.all(
            question.options.map(async option => {
              const count = await Submission.countDocuments({
                formId: id,
                'answers.questionId': question.id,
                'answers.value': option.value,
              });
              return {
                label: option.label,
                value: option.value,
                count,
              };
            })
          );
          return {
            questionId: question.id,
            label: question.label,
            type: question.type,
            optionStats,
          };
        }
        return null;
      })
    );

    res.json({
      totalSubmissions,
      attendedSubmissions,
      attendanceRate:
        totalSubmissions > 0
          ? (attendedSubmissions / totalSubmissions) * 100
          : 0,
      recentSubmissions,
      questionStats: questionStats.filter(Boolean),
    });
  } catch (error) {
    console.error('Get form stats error:', error);
    res.status(500).json({ message: 'Failed to get form statistics' });
  }
});

export default router;
