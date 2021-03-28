import Router from "koa-router";
import Server from "socket.io";
import { httpServer } from "../../config/chatServer";
import fs from "fs";
import path from "path";
import schedule from "node-schedule";
import {
  verifyClientId,
  verifyManagerInfo,
  judgeUser,
  registerManager,
  getServerState,
  setServerState,
  joinRoomMember,
  getPreview,
  saveMessage,
  loadDialog,
} from "../../services/chat/chat.ctrl";

const io = Server(httpServer, {
  cors: {
    origin: ["https://smpark.dev", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const smpChat = new Router();

smpChat.get("/image", (ctx) => {
  const name = ctx.query.name;
  const filename = path.join(__dirname, `/../../public/image/${name}`);
  const data = fs.readFileSync(filename);

  ctx.body = data;
});
// 최초 신청
smpChat.get("/chatService.js", async (ctx) => {
  const clientID = ctx.query.CLIENTID;

  if (!clientID || clientID === null) {
    ctx.status = 401;
    ctx.body = "CLIENTID가 누락되었습니다.";
  }

  const verifyResult = await verifyClientId(clientID);

  if (!verifyResult.result) {
    ctx.status = setResult.code;
    ctx.body = setResult.message;
  }

  const filename = __dirname + "/smpChatService.js";
  const data = fs.readFileSync(filename, "utf8");

  ctx.body = data;
});

smpChat.get("/chatService.css", (ctx) => {
  const cssName = __dirname + "/smpChatService.css";
  const datacss = fs.readFileSync(cssName, "utf8");

  ctx.type = "text/css";
  ctx.body = datacss;
});

// 채팅 연결 신청
smpChat.get("/", async (ctx) => {
  const { clientId, userId } = ctx.query;
  const type = await judgeUser(clientId, userId);
  let state = "";

  await registerManager(clientId, userId, type);

  state = await getServerState(clientId, userId, type);

  ctx.body = { type, state };
});

// 네임스페이스 동적 적용
const smpChatIo = io.of((name, query, next) => next(null, true));

smpChatIo.use(async (socket, next) => {
  const clientId = socket.handshake.query.clientId;
  const apiKey = socket.nsp.name.substring(1, socket.nsp.name.length);

  const verify = await verifyManagerInfo(clientId, apiKey);

  if (!verify.result) {
    const err = { content: verify.message };
    next(err);
    return;
  }

  socket.clientId = clientId;
  socket.userId = socket.handshake.query.userId;
  socket.userType = await judgeUser(socket.clientId, socket.userId);

  next();
});

smpChatIo.on("connection", async (socket) => {
  console.log(`Connected to socket.io ${socket.userId}`);

  socket.join(socket.userType);

  socketSend(socket).preview();

  socketReceive(socket).disconnect();

  socketReceive(socket).disconnecting();

  socketReceive(socket).switch();

  socketReceive(socket).message();

  socketReceive(socket).dialog();
});

const socketSend = function sendSocketContact(socket) {
  return {
    message: (msg) => {
      socket.emit("message", { message: "smp 채팅서버에 접속하였습니다." });
    },
    switch: (state) => {
      socket.emit("switch", state);
    },
    preview: async (log = null) => {
      if (log) socket.to("manager").emit("preview", log);

      if (socket.userType === "manager") {
        log = await getPreview(socket.clientId);

        if (log) socket.emit("preview", log);
      }
    },
    dialog: (log = null) => {
      if (log) socket.emit("dialog", log);
    },
  };
};

const socketReceive = function receiveSocketContact(socket) {
  return {
    disconnect: () => {
      socket.on("disconnect", (reason) => {
        console.log(reason);
      });
    },
    disconnecting: () => {
      socket.on("disconnecting", (reason) => {});
    },
    switch: () => {
      socket.on("switch", async (state) => {
        const setState = await setServerState(
          socket.clientId,
          socket.userId,
          state,
          socket.userType
        );

        if (!setState.result) console.log("err");

        socketSend(socket).switch(state);
      });
    },
    message: () => {
      socket.on("message", async (msg = null, img = null) => {
        const msgLog = await saveMessage(
          socket.clientId,
          socket.userId,
          msg,
          img,
          socket.userType
        );
        await joinRoomMember(socket.clientId, socket.userId, socket.userType);

        socketSend(socket).preview(msgLog);
      });
    },
    dialog: () => {
      socket.on("dialog", async (userId) => {
        const dialog = await loadDialog(socket.clientId, userId);

        socketSend(socket).dialog(dialog);
      });
    },
  };
};

export default smpChat;
