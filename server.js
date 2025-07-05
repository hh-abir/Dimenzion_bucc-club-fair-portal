import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";


const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
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

    socket.on('user-join', ({ userName, club, userType }) => {
      const userInfo = { userName, club, userType, socketId: socket.id };
      activeConnections.set(socket.id, userInfo);
      
      if (userType === 'admin') {
        socket.join(`admin-${club}`);
        console.log(`Admin ${userName} joined admin-${club}`);
      }
    });

    socket.on('join-conversation', ({ conversationId, userName, userType }) => {
      socket.join(conversationId);
      console.log(`${userType} ${userName} joined conversation ${conversationId}`);
      
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

    

    socket.on('send-private-message', (data) => {
      console.log('Broadcasting message to conversation:', data.conversationId);
      socket.to(data.conversationId).emit('receive-private-message', data);
    });

    socket.on('notify-user-blocked', ({ fingerprint, reason }) => {
  for (const [socketId, userInfo] of activeConnections.entries()) {
    if (userInfo.fingerprint === fingerprint && userInfo.userType === 'user') {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket) {
        targetSocket.emit('user-blocked-notification', { reason });
      }
    }
  }
});

    socket.on('admin-join-conversation', ({ conversationId, adminName }) => {
      socket.join(conversationId);
      console.log(`Admin ${adminName} joined conversation ${conversationId}`);
      
      socket.to(conversationId).emit('admin-joined', { adminName });
    });

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
      console.log(`> Ready on http:${hostname}:${port}`);
    });
});
