import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("healin_token")
        : null;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });
  }

  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
};