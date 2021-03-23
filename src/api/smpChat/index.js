import Router from "koa-router";
import server from "socket.io";
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
  createRoom,
  saveMessage,
} from "../../services/chat/chat.ctrl";

const io = server(httpServer);
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
  if (type === "manager") {
    await registerManager(clientId, userId);
    state = await getServerState(clientId, userId);
  }

  ctx.body = { type, state };
});

// 네임스페이스를 동적으로 적용
const smpChatIo = io.of(async (name, query, next) => {
  next(null, true);
});

smpChatIo.use(async (socket, next) => {
  const clientId = socket.handshake.query.clientId;
  const apiKey = socket.nsp.name.substring(1, socket.nsp.name.length);
  const verify = await verifyManagerInfo(clientId, apiKey);

  if (!verify.result) {
    const err = { content: verify.message };
    next(err);
    return;
  }

  next();
});

smpChatIo.on("connection", async (socket) => {
  const clientId = socket.handshake.query.clientId;
  const userId = socket.handshake.query.userId;

  console.log("Connected to socket.io SpaceName");

  socketReceive(socket).disconnect();
  socketReceive(socket).switch(clientId, userId);
  socketReceive(socket).message();

  socketSend(socket).message();

  // socket.on("disconnect", (reason) => {
  //   // socket.emit("switch", {
  //   //   state: await getServerState(userId),
  //   // });
  // });

  socket.emit("message", {});

  socket.on("message", (data) => {
    //console.log(userId, nickName, userType);
    if (userType === "client") {
      socket.join(userId, async () => {
        await createRoom(userId, nickName);
        const msgTime = await saveMessage(userId, data.message);
        console.log(msgTime);
        socket.emit("preview", {
          message: data.message,
          username: userId,
          nickName,
          msgTime,
        });
        // 메세지를 저장하고
        // 메세지를 관리자들에게 프리뷰로 띄우고
        // 관리자는 프리뷰 눌러서 조인 하자.
      });
    }
  });
});

const socketSend = function sendSocketContact(socket) {
  return {
    message: (msg) => {
      socket.emit("message", { message: "smp 채팅서버에 접속하였습니다." });
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
    switch: (clientId, userId) => {
      socket.on("switch", async (state) => {
        await setServerState(clientId, userId, state);
      });
    },
    message: () => {
      socket.on("message", (data) => {});
    },
  };
};

//   // 서버가 재연결 되었을 경우 room 처리

//   // 관리자 알람(preview)
//   socket.on("alarm", async () => {
//     const preview = await loadPreviewContent();
//     const reconnResult = await reconnectRoom(socket.id);
//     verifySocket.emit("preview", {
//       collection: preview,
//       name: reconnResult,
//     });
//   });

//   socket.on("managerReJoin", async (data) => {
//     const username = data.name;
//     const socketId = socket.id;
//     let loadRoom = await loadRoomName(username, socketId);
//     if (loadRoom.result) {
//       if (loadRoom.result === "already") {
//         const chatData = await loadChatContent(username);
//         socket.join(loadRoom.roomName, () => {
//           verifySocket.to(loadRoom.roomName).emit("message", {
//             type: "managerDialog",
//             name: username,
//             chatLog: chatData.chatLog,
//           });
//         });
//       }
//     }
//   });

//   socket.on("complete", async (data) => {
//     const username = data.name;
//     const socketId = socket.id;
//     const leaveRoomResult = await leaveRoom(username, socketId);
//     if (leaveRoomResult.result) {
//       socket.leave(leaveRoomResult.roomName);
//       verifySocket.to(leaveRoomResult.roomName).emit("message", {
//         type: "system",
//         message: `${data.managerName}님이 퇴장하셨습니다.`,
//       });
//       verifySocket.to(socketId).emit("complete", {
//         complete: true,
//         user: username,
//       });
//       // verifySocket.to(socketId).emit("message", {
//       //   type: "managerDialog",
//       //   name: "",
//       //   chatLog: "",
//       // });
//     } else {
//       console.log("complete 오류");
//     }
//   });

//   socket.on("roomEnterExit", async (data) => {
//     //매니저를 구분하는건 소켓아이디 밖에 없음..
//     const username = data.name;
//     const socketId = socket.id;

//     let loadRoom = await loadRoomName(username, socketId);
//     if (loadRoom.result === "leave") {
//       socket.leave(loadRoom.roomName);
//       loadRoom = await loadRoomName(username, socketId);
//     } else if (loadRoom.result === "another") {
//       return console.log("다른 매니저가 채팅중");
//     } else if (loadRoom.result === "already") {
//       return console.log("이미 접속중인 채팅룸");
//     } else if (!loadRoom.result) {
//       return console.log("에러 발생");
//     }
//     const chatData = await loadChatContent(username);

//     socket.join(loadRoom.roomName, () => {
//       verifySocket.to(loadRoom.roomName).emit("message", {
//         type: "managerDialog",
//         name: username,
//         chatLog: chatData.chatLog,
//       });
//       verifySocket.to(loadRoom.roomName).emit("message", {
//         type: "title",
//         title: data.managerName,
//       });
//       verifySocket.to(loadRoom.roomName).emit("message", {
//         type: "system",
//         message: `${data.managerName}님이 입장하였습니다.`,
//       });
//     });
//   });

//   // room 참여
//   socket.on("joinRoom", async (data) => {
//     const socketId = socket.id;
//     const name = data.username;
//     const roomName = await createRoom(name, socketId);
//     const chatData = await loadChatContent(name);
//     socket.join(roomName, () => {
//       verifySocket.emit("message", {
//         type: "dialog",
//         name: name,
//         chatLog: chatData.chatLog,
//       });
//       // 채팅방에 혼자가 아니라면..
//       if (chatData.managerNickName !== null) {
//         verifySocket.to(roomName).emit("message", {
//           type: "title",
//           title: chatData.managerNickName,
//         });
//       }
//     });
//   });

//   socket.on("message", async (data) => {
//     const saveResult = await saveChatContent(data);
//     if (!saveResult.result) {
//       socket.disconnect();
//       return;
//     }

//     verifySocket.emit("preview", {
//       name: data.username,
//       message: data.message,
//       time: saveResult.time.messageViewTime,
//       status: saveResult.status,
//       member: saveResult.member,
//     });
//     // 현재 시간과 메세지 시간의 날짜가 다르면 시스템 메세지에 현재 시간 넣기.
//     verifySocket.to(saveResult.roomName).emit("message", {
//       type: "message",
//       name: data.username,
//       logUser: saveResult.user,
//       message: data.message,
//       time: saveResult.time.messageViewTime,
//     });
//   });

//   socket.on("close", (reason) => {
//     socket.disconnect();
//   });

//   socket.on("scrollLoad", async (data) => {
//     console.log(data);
//   });
// });

export default smpChat;
