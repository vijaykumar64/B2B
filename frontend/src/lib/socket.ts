import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  const s = getSocket();
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
  socket = null;
};

export const joinChat = (chatId: string): void => {
  getSocket().emit('join:chat', chatId);
};

export const leaveChat = (chatId: string): void => {
  getSocket().emit('leave:chat', chatId);
};
