import { VercelRequest, VercelResponse } from '@vercel/node';

// 型定義
interface SubmissionData {
  formId: string;
  userName: string;
  userEmail: string;
  answers: Array<{
    questionId: string;
    value: string | string[] | number | boolean;
  }>;
  selectedOptionId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

// 一時的なデータストア（本番ではVercel KVやPlanetScaleなどに置き換え）
const submissions: SubmissionData[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // フォーム送信の保存
      const formData = req.body;
      const newSubmission: SubmissionData = {
        formId: formData.formId || '',
        userName: formData.userName || '',
        userEmail: formData.userEmail || '',
        answers: formData.answers || [],
        selectedOptionId: formData.selectedOptionId,
      };

      submissions.push(newSubmission);

      res.status(200).json({
        success: true,
        message: 'フォームが正常に送信されました',
        submissionId: newSubmission.formId, // Assuming formId is the submission ID for now
      });
    } else if (req.method === 'GET') {
      // 全送信内容の取得（管理者用）
      const { status, eventName } = req.query;

      const filteredSubmissions = [...submissions];

      if (status) {
        // This filtering logic needs to be adapted to the new SubmissionData structure
        // For now, we'll just return all submissions if status is provided
        // In a real application, you'd filter by a status field if it existed
      }

      if (eventName) {
        // This filtering logic needs to be adapted to the new SubmissionData structure
        // For now, we'll just return all submissions if eventName is provided
        // In a real application, you'd filter by an eventName field if it existed
      }

      res.status(200).json({
        success: true,
        submissions: filteredSubmissions,
        total: filteredSubmissions.length,
      });
    } else if (req.method === 'PUT') {
      // 送信内容の更新（管理者用）
      const { id } = req.query;
      const { status, adminNotes } = req.body;

      const submissionIndex = submissions.findIndex(s => s.formId === id);

      if (submissionIndex === -1) {
        res
          .status(404)
          .json({ success: false, message: '送信内容が見つかりません' });
        return;
      }

      submissions[submissionIndex] = {
        ...submissions[submissionIndex],
        status: status || submissions[submissionIndex].status,
        adminNotes: adminNotes || submissions[submissionIndex].adminNotes,
      };

      res.status(200).json({
        success: true,
        message: '送信内容が更新されました',
        submission: submissions[submissionIndex],
      });
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}
