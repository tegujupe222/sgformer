import { User, EventForm, Submission } from '../types';

// 通知タイプの定義
export type NotificationType =
  | 'form_submitted'
  | 'form_updated'
  | 'attendance_marked'
  | 'form_deleted'
  | 'user_registered'
  | 'system_alert';

// 通知の優先度
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// 通知インターフェース
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  recipientId?: string;
  recipientEmail?: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// メール通知の設定
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 通知サービスクラス
class NotificationService {
  private notifications: Notification[] = [];
  private emailConfig?: EmailConfig;

  constructor(emailConfig?: EmailConfig) {
    this.emailConfig = emailConfig;
  }

  // 通知を作成
  private createNotification(
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    recipientId?: string,
    recipientEmail?: string,
    data?: Record<string, any>
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      priority,
      recipientId,
      recipientEmail,
      data,
      read: false,
      createdAt: new Date(),
      expiresAt: this.calculateExpiryDate(priority),
    };

    this.notifications.push(notification);
    return notification;
  }

  // ID生成
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 有効期限の計算
  private calculateExpiryDate(priority: NotificationPriority): Date {
    const now = new Date();
    switch (priority) {
      case 'urgent':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1日
      case 'high':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1週間
      case 'medium':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1ヶ月
      case 'low':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3ヶ月
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  // フォーム提出通知
  async notifyFormSubmission(
    submission: Submission,
    form: EventForm,
    adminUser: User
  ): Promise<void> {
    const notification = this.createNotification(
      'form_submitted',
      '新しいフォーム提出',
      `${submission.userName}さんが「${form.title}」に提出しました。`,
      'medium',
      adminUser.id,
      adminUser.email,
      { submissionId: submission.id, formId: form.id }
    );

    // メール通知を送信
    await this.sendEmailNotification(notification);
  }

  // 出席確認通知
  async notifyAttendanceMarked(
    submission: Submission,
    form: EventForm,
    attended: boolean
  ): Promise<void> {
    const notification = this.createNotification(
      'attendance_marked',
      '出席確認完了',
      `${submission.userName}さんの出席が${attended ? '確認' : '未確認'}されました。`,
      'low',
      undefined,
      submission.userEmail,
      { submissionId: submission.id, formId: form.id, attended }
    );

    // メール通知を送信
    await this.sendEmailNotification(notification);
  }

  // フォーム更新通知
  async notifyFormUpdated(form: EventForm, adminUser: User): Promise<void> {
    const notification = this.createNotification(
      'form_updated',
      'フォーム更新',
      `「${form.title}」が更新されました。`,
      'medium',
      adminUser.id,
      adminUser.email,
      { formId: form.id }
    );

    await this.sendEmailNotification(notification);
  }

  // システムアラート
  async notifySystemAlert(
    title: string,
    message: string,
    priority: NotificationPriority = 'high'
  ): Promise<void> {
    const notification = this.createNotification(
      'system_alert',
      title,
      message,
      priority
    );

    await this.sendEmailNotification(notification);
  }

  // メール通知の送信
  private async sendEmailNotification(
    notification: Notification
  ): Promise<void> {
    if (!this.emailConfig || !notification.recipientEmail) {
      return;
    }

    try {
      // 実際のメール送信ロジックをここに実装
      // nodemailerなどのライブラリを使用
      console.log('Sending email notification:', {
        to: notification.recipientEmail,
        subject: notification.title,
        body: notification.message,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // 通知の取得
  getNotifications(
    userId?: string,
    unreadOnly: boolean = false
  ): Notification[] {
    let filtered = this.notifications;

    if (userId) {
      filtered = filtered.filter(n => n.recipientId === userId);
    }

    if (unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    // 有効期限切れの通知を除外
    const now = new Date();
    filtered = filtered.filter(n => !n.expiresAt || n.expiresAt > now);

    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // 通知を既読にする
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // 通知を削除
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(
      n => n.id !== notificationId
    );
  }

  // 未読通知数を取得
  getUnreadCount(userId?: string): number {
    return this.getNotifications(userId, true).length;
  }

  // 古い通知をクリーンアップ
  cleanupExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(
      n => !n.expiresAt || n.expiresAt > now
    );
  }
}

// シングルトンインスタンス
export const notificationService = new NotificationService();

// 通知テンプレート
export const notificationTemplates = {
  formSubmitted: (userName: string, formTitle: string) => ({
    title: '新しいフォーム提出',
    message: `${userName}さんが「${formTitle}」に提出しました。`,
  }),

  attendanceMarked: (userName: string, attended: boolean) => ({
    title: '出席確認完了',
    message: `${userName}さんの出席が${attended ? '確認' : '未確認'}されました。`,
  }),

  formUpdated: (formTitle: string) => ({
    title: 'フォーム更新',
    message: `「${formTitle}」が更新されました。`,
  }),

  systemAlert: (title: string, message: string) => ({
    title,
    message,
  }),
};
