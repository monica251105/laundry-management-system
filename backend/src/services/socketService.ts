import { Server, Socket } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join room for specific user
    socket.on('join', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export const emitOrderUpdate = (io: Server, userId: number, orderData: any) => {
  io.to(`user_${userId}`).emit('orderStatusChanged', orderData);
};
