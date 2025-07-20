import express from 'express';
import Submission from '../models/Submission';
import Form from '../models/Form';
import User from '../models/User';

const router = express.Router();

// 提出物一覧取得（管理者用）
router.get('/', async (req: any, res) => {
  try {
    // 開発環境ではデモデータを返す
    const demoSubmissions = [
      {
        id: 'sub-001',
        formId: 'form-2024-info-session',
        userId: 'user123',
        userName: '山田 太郎',
        userEmail: 'yamada.taro@example.com',
        selectedOptionId: 'session-am',
        answers: [],
        submittedAt: '2024-01-16T14:30:00Z',
        attended: false,
      },
      {
        id: 'sub-002',
        formId: 'form-2024-trial-lesson',
        userId: 'user456',
        userName: '佐藤 花子',
        userEmail: 'sato.hanako@example.com',
        selectedOptionId: 'math',
        answers: [],
        submittedAt: '2024-01-21T11:15:00Z',
        attended: true,
      },
      {
        id: 'sub-003',
        formId: 'form-2024-info-session',
        userId: 'user789',
        userName: '田中 次郎',
        userEmail: 'tanaka.jiro@example.com',
        selectedOptionId: 'session-pm',
        answers: [],
        submittedAt: '2024-01-17T09:45:00Z',
        attended: false,
      },
    ];

    res.json(demoSubmissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to get submissions' });
  }
});

// 提出物詳細取得
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate('formId', 'title questions')
      .populate('userId', 'name email')
      .lean();

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: req.user.email });
    if (user?.role === 'admin') {
      const form = await Form.findById(submission.formId);
      if (!form || form.createdBy.toString() !== (user._id as any).toString()) {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Failed to get submission' });
  }
});

// 提出物作成
router.post('/', async (req, res) => {
  try {
    const { formId, userName, userEmail, answers, attended = false } = req.body;

    // バリデーション
    if (!formId || !userName || !userEmail || !answers) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // フォームの存在確認
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // フォームがアクティブかチェック
    if (!form.settings.isActive) {
      return res.status(400).json({ message: 'Form is not active' });
    }

    // 回答期間のチェック
    const now = new Date();
    if (form.settings.startDate && now < form.settings.startDate) {
      return res.status(400).json({ message: 'Form is not yet open' });
    }
    if (form.settings.endDate && now > form.settings.endDate) {
      return res.status(400).json({ message: 'Form is closed' });
    }

    // 最大提出数のチェック
    if (form.settings.maxSubmissions) {
      const currentSubmissions = await Submission.countDocuments({ formId });
      if (currentSubmissions >= form.settings.maxSubmissions) {
        return res.status(400).json({ message: 'Maximum submissions reached' });
      }
    }

    // ユーザーIDの取得（ログインしている場合）
    let userId = undefined;
    if ((req as any).user) {
      const user = await User.findOne({ email: (req as any).user.email });
      if (user) {
        userId = (user as any)._id;
      }
    }

    // 重複提出のチェック（同じユーザーが同じフォームに複数回提出することを防ぐ）
    if (userId) {
      const existingSubmission = await Submission.findOne({ formId, userId });
      if (existingSubmission) {
        return res
          .status(400)
          .json({ message: 'You have already submitted this form' });
      }
    }

    // メールアドレスの重複チェック
    const existingSubmissionByEmail = await Submission.findOne({
      formId,
      userEmail,
    });
    if (existingSubmissionByEmail) {
      return res
        .status(400)
        .json({ message: 'This email has already been used for this form' });
    }

    // 回答のバリデーション
    const validationErrors = [];
    for (const question of form.questions) {
      const answer = answers.find((a: any) => a.questionId === question.id);

      if (question.required && (!answer || !answer.value)) {
        validationErrors.push(`${question.label} is required`);
      }

      if (answer && answer.value) {
        // 文字数制限のチェック
        if (
          question.validation?.minLength &&
          String(answer.value).length < question.validation.minLength
        ) {
          validationErrors.push(
            `${question.label} must be at least ${question.validation.minLength} characters`
          );
        }
        if (
          question.validation?.maxLength &&
          String(answer.value).length > question.validation.maxLength
        ) {
          validationErrors.push(
            `${question.label} must be at most ${question.validation.maxLength} characters`
          );
        }

        // 数値の範囲チェック
        if (question.type === 'number' && question.validation) {
          const numValue = Number(answer.value);
          if (
            question.validation.min !== undefined &&
            numValue < question.validation.min
          ) {
            validationErrors.push(
              `${question.label} must be at least ${question.validation.min}`
            );
          }
          if (
            question.validation.max !== undefined &&
            numValue > question.validation.max
          ) {
            validationErrors.push(
              `${question.label} must be at most ${question.validation.max}`
            );
          }
        }

        // メールアドレスの形式チェック
        if (question.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(answer.value))) {
            validationErrors.push(
              `${question.label} must be a valid email address`
            );
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation errors',
        errors: validationErrors,
      });
    }

    // 提出物の作成
    const submission = new Submission({
      formId,
      userId,
      userName,
      userEmail,
      answers,
      attended,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
      },
    });

    await submission.save();

    res.status(201).json({
      message: 'Submission created successfully',
      submission,
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Failed to create submission' });
  }
});

// 提出物更新（出席状況の変更など）
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { attended } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: req.user.email });
    if (user?.role === 'admin') {
      const form = await Form.findById(submission.formId);
      if (!form || form.createdBy.toString() !== (user._id as any).toString()) {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    // 更新
    if (attended !== undefined) {
      submission.attended = attended;
    }

    await submission.save();

    res.json({
      message: 'Submission updated successfully',
      submission,
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Failed to update submission' });
  }
});

// 提出物削除
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: req.user.email });
    if (user?.role === 'admin') {
      const form = await Form.findById(submission.formId);
      if (!form || form.createdBy.toString() !== (user._id as any).toString()) {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    await Submission.findByIdAndDelete(id);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Failed to delete submission' });
  }
});

// 提出物のエクスポート（CSV）
router.get('/:formId/export', async (req: any, res) => {
  try {
    const { formId } = req.params;
    const { format = 'csv' } = req.query;

    // 権限チェック
    const user = await User.findOne({ email: req.user.email });
    if (user?.role === 'admin') {
      const form = await Form.findById(formId);
      if (!form || form.createdBy.toString() !== (user._id as any).toString()) {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    const submissions = await Submission.find({ formId })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (format === 'csv') {
      // CSVヘッダーの作成
      const headers = ['提出日時', '名前', 'メールアドレス', '出席状況'];
      form.questions.forEach(question => {
        headers.push(question.label);
      });

      // CSVデータの作成
      const csvData = submissions.map(submission => {
        const row = [
          new Date(submission.submittedAt).toLocaleString('ja-JP'),
          submission.userName,
          submission.userEmail,
          submission.attended ? '出席' : '欠席',
        ];

        form.questions.forEach(question => {
          const answer = submission.answers.find(
            a => a.questionId === question.id
          );
          row.push(answer ? String(answer.value) : '');
        });

        return row.join(',');
      });

      const csv = [headers.join(','), ...csvData].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="submissions_${formId}.csv"`
      );
      res.send(csv);
    } else {
      res.json({ submissions });
    }
  } catch (error) {
    console.error('Export submissions error:', error);
    res.status(500).json({ message: 'Failed to export submissions' });
  }
});

// 提出物の出席状況のみを更新
router.patch('/:id/attendance', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { attended } = req.body;

    if (typeof attended !== 'boolean') {
      return res.status(400).json({ message: 'attended must be a boolean' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // 権限チェック
    const user = await User.findOne({ email: req.user.email });
    if (user?.role === 'admin') {
      const form = await Form.findById(submission.formId);
      if (!form || form.createdBy.toString() !== (user._id as any).toString()) {
        return res.status(403).json({ message: 'Permission denied' });
      }
    }

    submission.attended = attended;
    await submission.save();

    res.json({
      message: 'Attendance updated successfully',
      submission,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

export default router;
