import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";


const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const activeConnections = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their info
    socket.on('user-join', ({ userName, club, userType }) => {
      const userInfo = { userName, club, userType, socketId: socket.id };
      activeConnections.set(socket.id, userInfo);
      
      if (userType === 'admin') {
        socket.join(`admin-${club}`);
        console.log(`Admin ${userName} joined admin-${club}`);
      }
    });

    // User joins specific conversation room
    socket.on('join-conversation', ({ conversationId, userName, userType }) => {
      socket.join(conversationId);
      console.log(`${userType} ${userName} joined conversation ${conversationId}`);
      
      // If it's a user joining, notify admins
      if (userType === 'user') {
        const userInfo = activeConnections.get(socket.id);
        if (userInfo) {
          socket.to(`admin-${userInfo.club}`).emit('new-conversation', {
            conversationId,
            userName,
            club: userInfo.club,
            timestamp: new Date()
          });
        }
      }
    });

    // Send private message
    socket.on('send-private-message', (data) => {
      console.log('Broadcasting message to conversation:', data.conversationId);
      // Broadcast to everyone in the conversation room EXCEPT the sender
      socket.to(data.conversationId).emit('receive-private-message', data);
    });

    // Admin joins specific conversation
    socket.on('admin-join-conversation', ({ conversationId, adminName }) => {
      socket.join(conversationId);
      console.log(`Admin ${adminName} joined conversation ${conversationId}`);
      
      // Notify user that admin joined
      socket.to(conversationId).emit('admin-joined', { adminName });
    });

    // Admin leaves conversation
    socket.on('admin-leave-conversation', ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`Admin left conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
