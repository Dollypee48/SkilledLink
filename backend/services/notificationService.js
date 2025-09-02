const Notification = require('../models/Notification');
const { getIo } = require('../config/socket');

class NotificationService {
  // Create and send a notification
  static async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      
      // Populate sender and recipient details
      const populatedNotification = await notification.populate([
        { path: 'sender', select: 'name profileImageUrl' },
        { path: 'recipient', select: 'name profileImageUrl' }
      ]);

      // Send real-time notification via Socket.IO
      this.sendRealTimeNotification(populatedNotification);

      return populatedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send real-time notification via Socket.IO
  static sendRealTimeNotification(notification) {
    try {
      const io = getIo();
      if (io) {
        io.to(notification.recipient._id.toString()).emit('newNotification', notification);
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Create job status change notification
  static async notifyJobStatusChange(jobData, newStatus, recipientId, senderId = null) {
    let title, message, type, category, important;

    switch (newStatus) {
      case 'Accepted':
        title = 'Job Started!';
        message = `Your ${jobData.service} job has been accepted and is now in progress.`;
        type = 'success';
        category = 'job_status';
        important = true;
        break;
      
      case 'Pending Confirmation':
        title = 'Job Completion Request';
        message = `The artisan has completed your ${jobData.service} job and is waiting for your confirmation. Please check your messages.`;
        type = 'warning';
        category = 'job_status';
        important = true;
        break;
      
      case 'Completed':
        title = 'Job Completed!';
        message = `Your ${jobData.service} job has been completed successfully.`;
        type = 'success';
        category = 'job_status';
        important = true;
        break;
      
      case 'Declined':
        title = 'Job Declined';
        message = `Unfortunately, your ${jobData.service} job has been declined by the artisan.`;
        type = 'error';
        category = 'job_status';
        important = true;
        break;
      
      default:
        title = 'Job Status Updated';
        message = `Your ${jobData.service} job status has been updated to: ${newStatus}`;
        type = 'info';
        category = 'job_status';
        important = false;
    }

    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      title,
      message,
      type,
      category,
      important,
      data: {
        jobId: jobData._id,
        service: jobData.service,
        status: newStatus
      }
    });
  }

  // Create message notification
  static async notifyNewMessage(messageData, recipientId) {
    return this.createNotification({
      recipient: recipientId,
      sender: messageData.sender._id,
      title: 'New Message',
      message: `New message from ${messageData.sender.name}: ${messageData.content?.substring(0, 50)}${messageData.content?.length > 50 ? '...' : ''}`,
      type: 'info',
      category: 'message',
      important: false,
      data: {
        messageId: messageData._id,
        conversationId: messageData.conversationId,
        senderName: messageData.sender.name
      }
    });
  }

  // Get user's notifications
  static async getUserNotifications(userId, limit = 50, skip = 0) {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('sender', 'name profileImageUrl')
        .populate('recipient', 'name profileImageUrl');

      // Ensure all required fields are present
      return notifications.map(notification => ({
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        important: notification.important,
        read: notification.read,
        data: notification.data,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        sender: notification.sender,
        recipient: notification.recipient
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Clear all notifications for a user
  static async clearAllNotifications(userId) {
    try {
      console.log('NotificationService: Clearing all notifications for user:', userId);
      
      // First, count how many notifications exist
      const countBefore = await Notification.countDocuments({ recipient: userId });
      console.log('NotificationService: Found', countBefore, 'notifications to delete');
      
      const result = await Notification.deleteMany({
        recipient: userId
      });
      
      console.log('NotificationService: Delete result:', result);
      return result;
    } catch (error) {
      console.error('NotificationService: Error clearing all notifications:', error);
      console.error('NotificationService: Error details:', {
        message: error.message,
        stack: error.stack,
        userId: userId
      });
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        read: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Delete old notifications (cleanup)
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
