import Router from "koa-router";
import server from "socket.io";
import { httpServer } from "../../config/chatServer";
import fs from "fs";
import path, { resolve } from "path";
import schedule from "node-schedule";
import {
  verifyClientId,
  verifyManagerInfo,
  chatSocketIdSetting,
  registerOption,
  createRoom,
  loadRoomName,
  saveMessage,
  loadChatContent,
  loadPreviewContent,
  reconnectRoom,
  chatNickNameSetting,
  leaveRoom,
  findUserType,
  loadManagerChatContents,
  loadClientChatContents,
  registerManager,
} from "../../services/chat/chat.ctrl";

const io = server(httpServer);
const chat = new Router();
chat.get("/image", (ctx) => {
  const name = ctx.query.name;
  const filename = path.join(__dirname, `/../../public/image/${name}`);
  const data = fs.readFileSync(filename);
  ctx.body = data;
});
// 최초 신청
chat.get("/chatService.js", async (ctx) => {
  const clientID = ctx.query.CLIENTID;
  if (!clientID || clientID === null) {
    ctx.status = 401;
    ctx.body = "CLIENTID가 누락되었습니다.";
    return;
  }

  const setResult = await verifyClientId(clientID);
  if (!setResult.result) {
    ctx.status = setResult.code;
    ctx.body = setResult.message;
    return;
  }

  const filename = __dirname + "/smpChatServiceCopy.js";
  const data = fs.readFileSync(filename, "utf8");
  ctx.body = data;
});

// 채팅 연결 신청
// chat.get("/", async (ctx) => {
//   const clientid = ctx.query.CLIENTID;
//   const apiKey = ctx.query.APIKEY;
//   const verifyResult = await verifyIdApiKey(clientid, apiKey);
//   ctx.body = {
//     result: verifyResult.result,
//     state: verifyResult.state,
//     message: verifyResult.message,
//   };
//   return;
// });

// 네임스페이스를 동적으로 적용
const smpChatIo = io.of(async (name, query, next) => {
  next(null, true);
});
// // 네임스페이스 미들웨어 적용
smpChatIo.use(async (socket, next) => {
  const apiKey = socket.nsp.name.substring(1, socket.nsp.name.length);
  const clientId = socket.handshake.query.CLIENTID;
  const verify = await verifyManagerInfo(clientId, apiKey);
  const ERR = new Error("인증 실패");
  ERR.data = { content: verify.message };
  verify.result ? next() : next(ERR);

  // 관리자를 oauth서버에 등록 시켜서 관리자를 구분하자. clear
  // 1. oauth 서버 관리자 기능 추가  claer
  // 2. 채팅서버 서버, 클라이언트 html 복구
  // 3. join leave 기능 처리

  // 관리자의 socket.id를 업데이트
  // if (!apiKey) {
  //   const setResult = await chatSocketIdSetting(clientId, apiKey);
  //   if (!setResult) {
  //     return console.log("chatSocketIdSetting 에러발생!");
  //   }
  // }
  // if (nickName) {
  //   const setResult = await chatNickNameSetting(clientId, nickName);
  //   if (!setResult) {
  //     return console.log("chatNickNameSetting 에러발생!");
  //   }
  // }
});

smpChatIo.on("connection", async (socket) => {
  console.log("Connected to socket.io SpaceName");

  socket.emit("message", {
    message: "smp 채팅서버에 접속하였습니다.",
  });

  const clientId = socket.handshake.query.CLIENTID;
  const userId = socket.handshake.query.USERID;
  const nickName = socket.handshake.query.NICKNAME;
  const managerId = await findUserType(clientId, userId);
  await registerManager(managerId);
  let { chatLog, userType } = "";
  if (userId === managerId) {
    userType = "manager";
    //chatLog = loadManagerChatContents(userId);
  } else {
    userType = "client";
    //chatLog = loadClientChatContents(userId);
  }
  socket.emit("initChat", {
    nickName,
    chatLog,
    userType,
  });


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
    if (userType === "manager") {
    }
  });

  // loadChatContent();
  // loadPreviewContent();

  /* 전체 알고리즘 */
  // 1.chatlog 뿌리기 and 자동 room join
  // 1-1 관리자는 managerMember의 유저 이름을 통해 chatMember를 검색해 본인과의 채팅 기록을 검색하여 가져온다.
  // 1-2 managerMember의 유저의 이름+시간이 있으면 join 한다.
  // 1-3 채팅 기록중 가장 최신 내용 미리보기에 기재 한다.
  // 1-4 클라이언트는 본인 id를 통해 최근 채팅 데이터를 가져온다.
  // 1-5 current member에 관리자가 접속 중이라면 join 한다.

  // 2.채팅 내용 send시
  // 2-1 클라이언트는 본인 아이디+시간 room에 join
  // 2-2 매니저는 socket.rooms를 이용하여 채팅 요청목록 확인
  // 2-3 클라이언트의 메시지 내용만 미리보기로 던진다.
  // 2-4 미리보기 클릭시 해당 채팅룸 join한다.(3-2 참고) currentMember, managerMember, chatMember 갱신
  // 2-5 미리보기로 들어온 내용의 chatMember에 관리자 아이디 추가
  // 2-6 채팅 내용 db에 저장
  // 2-7 매니저도 db에 저장

  // 3.관리자가 나가기 누를시
  // 3-1 나가기는 관리자만 있으며 채팅룸을 떠난다.
  // 3-2 managerMember에 아이디가 있는 상태에서 다른 유저(미리보기)를 누르면 채팅룸을 떠난뒤 join 한다.
  // 관리자 알람(preview)

  // socket.on("chatLog", async () => {
  //   const preview = await loadPreviewContent();
  //   const reconnResult = await reconnectRoom(socket.id);
  //   verifySocket.emit("preview", {
  //     collection: preview,
  //     name: reconnResult,
  //   });
  // });

  // smpChatIo.on("requestManagerChat",(data)=> {
  //   socket.join(data.userId);
  // })
  // smpChatIo.on("responseClientChat", (data)=> {
  //   socket.join(data.userId);
  // })
});

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

export default chat;
