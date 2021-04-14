import { Server } from "socket.io";
import { httpServer } from "../../config/chatServer";
import {
  checkDuplicateUser,
  checkRefreshUser,
} from "../../services/chat/chat.functions.js";
import {
  verifyManagerInfo,
  judgeUserType,
  setServerState,
  joinRoomMember,
  getPreview,
  saveMessage,
  loadDialog,
  getClientName,
  observeMessageCheck,
  getObserveCount,
} from "../../services/chat/chat.ctrl";

const io = new Server(httpServer, {
  cors: {
    origin: ["https://smpark.dev", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// 네임스페이스 동적 적용
const smpChatIo = io.of((name, query, next) => next(null, true));

// 미들웨어
smpChatIo.use(async (socket, next) => {
  const clientId = socket.handshake.query.clientId;
  const apiKey = socket.handshake.auth.apiKey;
  const verify = await verifyManagerInfo(clientId, apiKey);

  if (!verify.result) return next(smpChatError(verify));

  socket.clientId = clientId;
  socket.userId = socket.handshake.query.userId;
  socket.userType = await judgeUserType(socket.clientId, socket.userId);

  checkRefreshUser(socket, "access");
  const socketUsers = checkDuplicateUser(socket);

  if (!socketUsers.result) return next(smpChatError(socketUsers));

  socket.users = socketUsers;

  next();
});

smpChatIo.on("connection", async (socket) => {
  console.log(`Connected to socket.io ${socket.userId}`);

  // console.log(io.engine.clientsCount);

  socketSend(socket).start();

  socketReceive(socket).disconnect();

  socketReceive(socket).disconnecting();

  socketReceive(socket).switch();

  socketReceive(socket).message();

  socketReceive(socket).dialog();

  socketReceive(socket).prevDialog();

  socketReceive(socket).observe();
});

const socketSend = function sendSocketContact(socket) {
  return {
    start: async () => {
      socket.join(socket.userType);

      let previewLog = null;
      let clientName = socket.userId;
      let alarmCount = null;

      if (socket.userType === "manager") {
        previewLog = await getPreview(socket);
        clientName = await getClientName(socket);
        alarmCount = await getObserveCount(socket);
      }

      socket.join(clientName);

      const dialog = await loadDialog(socket);

      socket.emit("start", { dialog, previewLog, alarmCount });
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
      const PREVIEW_TYPE = "Create";

      if (log[0].message === null && log[0].image) {
        log[0].message = "사진을 보냈습니다.";
      }

      socket.userType === "manager"
        ? socket.emit("preview", log[0], PREVIEW_TYPE)
        : socket.to("manager").emit("preview", log[0], PREVIEW_TYPE);
    },
    dialog: (dialog, roomName) => {
      const PREVIEW_TYPE = "Delete";

      socket.to("manager").emit("preview", roomName, PREVIEW_TYPE);

      socket.emit("dialog", dialog);
    },
    prevDialog: (log) => {
      socket.emit("prevDialog", log);
    },
    observe: (roomName) => {
      socket.to(roomName).emit("observe", true, roomName);
    },
  };
};

const socketReceive = function receiveSocketContact(socket) {
  return {
    disconnect: () => {
      socket.on("disconnect", async (reason) => {
        checkDuplicateUser(socket, socket.users);
      });
    },
    disconnecting: () => {
      socket.on("disconnecting", async (reason) => {
        checkDuplicateUser(socket, socket.users);
        checkRefreshUser(socket, "refresh");

        setTimeout(async () => {
          const result = checkRefreshUser(socket, "check");
          if (result === "off") {
            const setState = await setServerState(socket, result);

            if (!setState.result) console.log("err");
          }
        }, 30000);
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
        if (socket.userType === "client") await joinRoomMember(socket);

        const msgLog = await saveMessage(socket, msg, img);

        if (!msgLog) return;

        socketSend(socket).preview(msgLog);
        socketSend(socket).message(msgLog);
      });
    },
    dialog: () => {
      socket.on("dialog", async (roomName) => {
        const result = await joinRoomMember(socket, roomName);

        if (result.state === "chatting") return;

        const dialog = await loadDialog(socket);

        if (dialog.length === 0) return;

        socket.leave(result.prevUserId);

        socket.join(roomName);

        socketSend(socket).dialog(dialog, roomName);
      });
    },
    prevDialog: () => {
      socket.on("prevDialog", async (seq) => {
        const prevDialog = await loadDialog(socket, seq);

        if (prevDialog.length === 0) return;

        socketSend(socket).prevDialog(prevDialog);
      });
    },
    observe: () => {
      socket.on("observe", async (roomName) => {
        const result = await observeMessageCheck(socket, roomName);

        if (!result) return;

        socketSend(socket).observe(roomName);
      });
    },
  };
};

const smpChatError = ({ message }) => {
  const err = new Error(message);

  err.data = { message, state: "off" };

  return err;
};

export default httpServer;
