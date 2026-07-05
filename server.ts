import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import type { IncomingMessage } from "http";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "/", true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: { origin: process.env.AUTH_URL ?? "http://localhost:3000" },
  });

  // Make io available to API routes in the same process
  (globalThis as unknown as Record<string, unknown>).__io = io;

  io.use(async (socket, next) => {
    try {
      const req = socket.request as IncomingMessage;
      const cookieHeader = req.headers.cookie ?? "";

      // Parse the session token from the cookie header manually
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...v] = c.trim().split("=");
          return [k.trim(), decodeURIComponent(v.join("="))];
        })
      );

      const tokenCookieName =
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token";

      const rawToken = cookies[tokenCookieName];
      if (!rawToken) return next(new Error("Unauthorized"));

      const { decode } = await import("next-auth/jwt");
      const token = await decode({
        token: rawToken,
        secret: process.env.AUTH_SECRET!,
        salt: tokenCookieName,
      });

      if (!token?.sub) return next(new Error("Unauthorized"));
      socket.data.userId = token.sub;
      socket.data.userName = (token.name as string) ?? "Unknown";
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, userName } = socket.data as { userId: string; userName: string };

    socket.on("join-document", (docId: string) => {
      socket.join(docId);
      socket.to(docId).emit("user-joined", { userId, userName });

      const room = io.sockets.adapter.rooms.get(docId);
      const onlineCount = room ? room.size : 1;
      io.to(docId).emit("presence-update", { userId, userName, online: true, onlineCount });
    });

    socket.on("document-updated", (payload: { docId: string; content: string; serverClock: number }) => {
      socket.to(payload.docId).emit("document-updated", {
        content: payload.content,
        serverClock: payload.serverClock,
        updatedBy: userId,
      });
    });

    socket.on("typing", (docId: string) => {
      socket.to(docId).emit("user-typing", { userId, userName });
    });

    socket.on("leave-document", (docId: string) => {
      socket.leave(docId);
      socket.to(docId).emit("presence-update", { userId, userName, online: false });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("presence-update", { userId, userName, online: false });
        }
      }
    });
  });

  const port = parseInt(process.env.PORT ?? "3000", 10);
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
