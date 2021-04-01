import { Server } from "socket.io";
import { httpServer } from "../../config/chatServer";
import schedule from "node-schedule";
import {
  verifyManagerInfo,
  judgeUserType,
  setServerState,
  joinRoomMember,
  getPreview,
  saveMessage,
  loadDialog,
  getClientName,
} from "../../services/chat/chat.ctrl";

const io = new Server(httpServer, {
  cors: {
    origin: ["https://smpark.dev", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// 네임스페이스 동적 적용
const smpChatIo = io.of((name, query, next) => next(null, true));

smpChatIo.use(async (socket, next) => {
  const clientId = socket.handshake.query.clientId;
  const apiKey = socket.handshake.auth.apiKey;
  const verify = await verifyManagerInfo(clientId, apiKey);

  if (!verify.result) {
    const err = new Error("not_authorized");
    err.data = { message: verify.message };
    next(err);
    return;
  }

  socket.clientId = clientId;
  socket.userId = socket.handshake.query.userId;
  socket.userType = await judgeUserType(socket.clientId, socket.userId);

  const socketUsers = accessUser(socket);

  if (socketUsers.message) {
    const err = new Error("duplicate_connection");
    err.data = { message: "duplicate_connection", state: "off" };
    next(err);
    return;
  }

  socket.users = socketUsers;

  next();
});

smpChatIo.on("connection", async (socket) => {
  console.log(`Connected to socket.io ${socket.userId}`);

  socketSend(socket).start();

  socketReceive(socket).disconnect();

  socketReceive(socket).disconnecting();

  socketReceive(socket).switch();

  socketReceive(socket).message();

  socketReceive(socket).dialog();
});

const socketSend = function sendSocketContact(socket) {
  return {
    start: async () => {
      socket.join(socket.userType);

      let previewLog = null;
      let clientName = socket.userId;

      if (socket.userType === "manager") {
        previewLog = await getPreview(socket);
        clientName = await getClientName(socket);
      }

      socket.join(clientName);

      const dialog = await loadDialog(socket);

      socket.emit("start", { dialog, previewLog });
    },
    message: (log) => {
      if (log.length !== 0) {
        smpChatIo.to(log[0].roomName).emit("message", log[0]);
      }
    },
    switch: (state) => {
      socket.emit("switch", state);
    },
    preview: (log) => {
      socket.userType === "manager"
        ? socket.emit("preview", log[0])
        : socket.to("manager").emit("preview", log[0]);
    },
    dialog: (log) => {
      socket.emit("dialog", log);
    },
  };
};

const socketReceive = function receiveSocketContact(socket) {
  return {
    disconnect: () => {
      socket.on("disconnect", async (reason) => {});
    },
    disconnecting: () => {
      socket.on("disconnecting", async (reason) => {
        console.log("disconnecting", socket.users);
        accessUser(socket, socket.users);
      });
    },
    switch: () => {
      socket.on("switch", async (state) => {
        const setState = await setServerState(socket, state);

        if (!setState.result) console.log("err");

        socketSend(socket).switch(state);
      });
    },
    message: () => {
      socket.on("message", async (msg = null, img = null) => {
        if (socket.userType === "client") {
          await joinRoomMember(socket);
        }

        const msgLog = await saveMessage(socket, msg, img);

        socketSend(socket).preview(msgLog);
        socketSend(socket).message(msgLog);
      });
    },
    dialog: () => {
      socket.on("dialog", async (userId) => {
        const prevUserId = await joinRoomMember(socket, userId);
        const dialog = await loadDialog(socket);

        socket.leave(prevUserId);
        socket.join(userId);

        socketSend(socket).dialog(dialog);
      });
    },
  };
};

const accessUser = (function checkDuplicateAccessUser() {
  let accessUsers = [];

  return (socket, arr = []) => {
    let message = "";

    /* 새고로침으로 나가면 
      해당 유저의 배열을 비워주자.
    */
    if (arr.length !== 0) {
      accessUsers = accessUsers.filter((user) => user.userId !== socket.userId);
      message = "";
    } else {
      accessUsers.map((user) => {
        if (user.userId === socket.userId) {
          message = "duplicate_connection";
        }
      });

      if (message === "") {
        accessUsers.push({ userId: socket.userId, socketId: socket.id });
      }
    }

    return { accessUsers, message };
  };
})();

export default httpServer;
