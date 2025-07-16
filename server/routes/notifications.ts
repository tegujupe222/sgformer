import express from 'express';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// 通知一覧取得
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const notifications = notificationService.getNotifications(userId);
  res.json(notifications);
});

// 通知を既読化
router.post('/:userId/:notificationId/read', (req, res) => {
  const { userId, notificationId } = req.params;
  const notifications = notificationService.getNotifications(userId);
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    res.json({ message: 'Notification marked as read' });
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
});

// 全通知を既読化
router.post('/:userId/read-all', (req, res) => {
  const { userId } = req.params;
  const notifications = notificationService.getNotifications(userId);
  notifications.forEach(n => (n.read = true));
  res.json({ message: 'All notifications marked as read' });
});

// 通知削除
router.delete('/:userId/:notificationId', (req, res) => {
  const { userId, notificationId } = req.params;
  let notifications = notificationService.getNotifications(userId);
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    notifications.splice(index, 1);
    res.json({ message: 'Notification deleted' });
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
});

export default router; 