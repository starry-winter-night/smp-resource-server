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
  checkDuplicateUser,
  observeMessageCheck,
  countMessageAlarm,
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

  const socketUsers = checkDuplicateUser(socket);

  if (!socketUsers.result) return next(smpChatError(socketUsers));

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

  socketReceive(socket).prevDialog();

  socketReceive(socket).observe();
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
      if (log[0].message === null && log[0].image) {
        log[0].message = "사진을 보냈습니다.";
      }

      socket.userType === "manager"
        ? socket.emit("preview", log[0])
        : socket.to("manager").emit("preview", log[0]);
    },
    dialog: (log) => {
      socket.emit("dialog", log);
    },
    prevDialog: (log) => {
      socket.emit("prevDialog", log);
    },
    observe: (roomName) => {
      socket.to(roomName).emit("observe", true, roomName);
    },
    alarm: (alarm, roomName) => {
      socket.userType === "manager"
        ? socket.to(roomName).emit("alarm", alarm)
        : socket.to("manager").emit("alarm", alarm);
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
        checkDuplicateUser(socket, socket.users);
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
        // 관리자.. 아무랑도 접속안했을때 처리하자..
        // 연결이 되엇을때만 .. 연락하도록..
        // 연결이 끊겼을때 상황부터 만드는게 맞을것 같다.
        if (socket.userType === "manager" && !socket.joinRoom) return;

        if (socket.userType === "client") await joinRoomMember(socket);

        const msgLog = await saveMessage(socket, msg, img);

        const countAlarm = countMessageAlarm.increase(msgLog[0].userId);

        socketSend(socket).alarm(countAlarm, msgLog[0].roomName);
        socketSend(socket).preview(msgLog);
        socketSend(socket).message(msgLog);
      });
    },
    dialog: () => {
      socket.on("dialog", async (roomName) => {
        const prevUserId = await joinRoomMember(socket, roomName);
        const dialog = await loadDialog(socket);

        if (dialog.length === 0) return;

        socket.leave(prevUserId);

        socket.join(roomName);

        socketSend(socket).dialog(dialog);

        const result = await observeMessageCheck(socket, roomName);

        if (!result) return;

        socketSend(socket).observe(roomName);
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

        // 메세지를 보낸 유저의 아이디를 넣어야 한다.
        // ctrl에서 roomName으로 매니저아이디를 찾자. 
        // const countAlarm = countMessageAlarm.decrease(msgLog[0].userId);

        // socketSend(socket).alarm(countAlarm, roomName);
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
