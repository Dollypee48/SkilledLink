const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io; // Declare io as a module-scoped variable
const connectedUsers = new Map(); // Map userId to socketId

const setupSocket = (httpServer) => {
  if (io) {
    return io;
  }
  // Socket.IO configured with CORS
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow your frontend origin
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      // console.log('Socket.IO Auth - User authenticated:', decoded.id, decoded.role);
      next();
    } catch (err) {
      // console.log('Socket.IO Auth - Token verification failed:', err.message);
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      } else if (err.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token signature'));
      }
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // console.log('Socket.IO - User connected:', socket.userId, socket.id);
    connectedUsers.set(socket.userId, socket.id);

    socket.join(socket.userId);

    socket.on('disconnect', (reason) => {
      // console.log('Socket.IO - User disconnected:', socket.userId, reason);
      connectedUsers.delete(socket.userId);
    });

    // Handle notification events
    socket.on('markNotificationRead', async (notificationId) => {
      try {
        // This could be handled by the notification service
        // For now, we'll just acknowledge the event
        socket.emit('notificationMarkedRead', { notificationId, success: true });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('notificationMarkedRead', { notificationId, success: false, error: error.message });
      }
    });

    // You can add more socket event handlers here, e.g., for sending messages
    // For now, messages will be emitted from the messageController after DB save.
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call setupSocket first.');
  }
  return io;
};

module.exports = { setupSocket, getIo, connectedUsers };
