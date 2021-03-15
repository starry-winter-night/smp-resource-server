import {
  createMsgTime,
  searchMember,
  searchChatRoomInfo,
  searchPrevClientName,
  loadLatestLog,
  changeUTC,
  findManagerId,
} from "./chat.functions";
import ManagerChat from "../../models/chatManager";
import ClientChat from "../../models/chatClient";
import Member from "../../models/member";
import Oauth from "../../models/oauth";

export const registerOption = async (clientId, option) => {
  let { message, code, state, result } = "";
  const defaultName = "Host";
  const manager = await ManagerChat.findByClientId(clientId);
  if (manager === null) {
    result = false;
    message = "clientId와 연결된 apiKey가 일치하지 않습니다.";
    code = 500;
  } else {
    if (option) {
      const nickName = option.nickName;
      if (!nickName) {
        await manager.updateByNickName(nickName);
      } else {
        await manager.updateByNickName(defaultName);
      }
      const userDate = changeUTC(option);
      const nowDate = new Date().valueOf();
      if (!userDate) {
        result = false;
        message = "시간 옵션 형식이 잘못되었습니다.";
        state = "off";
      } else {
        await manager.updateBychatTime(option);
        if (nowDate > userDate.startDate && nowDate < userDate.endDate) {
          result = true;
          message = "채팅 서버와 연결되었습니다.";
          state = "on";
        } else {
          result = true;
          message = "상담 시간이 아닙니다.";
          state = "off";
        }
      }
    } else {
      await manager.updateByNickName(defaultName);
      result = true;
      message = "채팅 서버와 연결되었습니다.";
      state = "on";
    }
    const data = { result, message, state, code };
    return data;
  }
};

export const registerManager = async (managerId) => {
  const manager = await ManagerChat.findByUsername(managerId);
  if (!manager && typeof managerId === "string") {
    const managerChat = new ManagerChat({
      managerId,
      managerMember: "",
    });
    await managerChat.save();
    return;
  }
  return;
};

export const verifyClientId = async (clientId) => {
  // 클라이언트 id가 chat에 등록되어있는지 확인
  const manager = await ManagerChat.findByClientId(clientId);
  const member = await Member.findByClientId(clientId);
  let { message, code, result } = "";
  if (member === null) {
    result = false;
    code = 500;
    message = "등록된 CLIENTID가 아닙니다.";
  } else {
    // 1-1 최초등록
    if (manager === null) {
      const managerChat = new ManagerChat({
        clientId,
        chatApiKey: member.client.chatApiKey,
      });
      await managerChat.save();
    }
    result = true;
  }
  const data = { result, message, code };
  return data;
};

export const verifyManagerInfo = async (clientId, apiKey) => {
  let result = false;
  let message = "";
  const oauth = await Oauth.findByChatApiKey(apiKey);
  if (oauth === null) {
    message = "등록된 apikey가 아닙니다.";
  } else if (clientId !== oauth.client.clientId) {
    message = "apiKey정보가 일치하지 않습니다.";
  } else {
    result = true;
  }
  const data = { result, message };
  return data;

  // const managerInfo = await ManagerChat.findByClientId(clientId);
  // const oauth = await Oauth.findByClientId(clientId);
  // let { message, code } = "";
  // let result = true;
  // let state = chatState;
  // if (oauth === null) {
  //   result = false;
  //   code = 500;
  //   message = "등록된 CLIENTID가 아닙니다.";
  // } else {
  //   if (chatState === null) {
  //     const regState = managerInfo.chatState;
  //     if (regState === null || !regState) {
  //       state = "off";
  //       // off 버튼을 눌러 서버를 직접 끊을 경우
  //     } else {
  //       state = regState;
  //     }
  //   } else if (chatState === "on") {
  //     // 관리자 정보 저장.
  //     const managerId = oauth.client.username;
  //     const nameSpace = clientId;
  //     const managerChat = new ManagerChat({
  //       managerId,
  //       clientId,
  //       nameSpace,
  //       chatState,
  //     });

  //     // 최초의 관리자 정보 저장
  //     if (managerInfo.managerId === undefined) {
  //       // username index 생성 및 유니크 적용
  //       await managerChat.collection.createIndex(
  //         { managerId: 1 },
  //         { unique: true }
  //       );
  //       await managerInfo.updateByManager(managerChat);

  //       //n번째 관리자 정보 저장
  //     } else {
  //       if (chatState !== managerInfo.chatState) {
  //         await managerInfo.updateByChatState(chatState);
  //       }
  //     }
  //     message = "채팅 서버가 정상적으로 연결되었습니다.";
  //     // 관리자가 직접 서버를 끈 경우
  //   } else if (chatState === "off") {
  //     /* db에 연결정보와 받아온 연결정보가 같지 않으면 on을 off로 변경 */
  //     if (chatState !== managerInfo.chatState) {
  //       await managerInfo.updateByChatState(chatState);
  //     } else {
  //       message = "채팅 서버가 정상적으로 종료되었습니다.";
  //     }
  //   } else {
  //     result = false;
  //     code = 500;
  //     message = "chatState 변수가 잘못되었습니다.";
  //   }
  // }
  // const data = { result, state, code, message };
  // return data;
};

export const chatSocketIdSetting = async (clientId, socketId) => {
  const managerInfo = await ManagerChat.findByClientId(clientId);
  if (managerInfo === null) {
    return false;
  } else {
    await managerInfo.updateBySocketId(socketId);
    return true;
  }
};

export const chatNickNameSetting = async (clientId, nickName) => {
  const managerInfo = await ManagerChat.findByClientId(clientId);
  if (managerInfo === null) {
    return false;
  } else {
    await managerInfo.updateByNickName(nickName);
    return true;
  }
};

export const createRoom = async (name, nickName) => {
  const client = await ClientChat.findByUsername(name);
  if (client === null) {
    const ROOM_STATUS = "waiting";
    const member = [name];
    const clientChat = new ClientChat({
      room: {
        roomName: name,
        userName: name,
        nickName: nickName,
        status: ROOM_STATUS,
        currentMember: member,
      },
    });
    await clientChat.save();
  }
};

export const loadPreviewContent = async () => {
  // 멤버가 존재할때만 가져온다.
  const chat = await ClientChat.findByStatusChatting();
  let chatLastLogs = [];
  // 채팅이 존재 하면
  if (chat.length !== 0) {
    chat.map((chatData) => {
      const chatLog = chatData.room.chatLog;
      // 채팅 내역이 존재하는 유저만
      if (chatLog.length !== 0) {
        const data = {
          chatLog: chatLog[chatData.room.chatLog.length - 1],
          roomName: chatData.room.roomName,
          username: chatData.room.username,
          status: chatData.room.status,
          member: chatData.room.Member,
        };
        chatLastLogs.push(data);
      }
    });
  }
  return chatLastLogs;
};
export const loadManagerChatContents = async (id) => {
  const manager = await ManagerChat.findByUsername(id);
  const chat = await ClientChat.findByUsername(manager.managerMember);
  if (!chat) return;
  const chatLog = chat.room.chatLog;
  const log = chatLog.map((log) => {
    log.chatMember.map((userId) => {
      if (userId === id) {
        return log;
      }
    });
  });
  console.log("253줄", log);
  const chatLastLog = chatLog[chat.room.chatLog.length - 1];

  /// 여기 할 차례 ~_~
};
export const loadClientChatContents = async (id) => {
  const chat = await ClientChat.findByUsername(id);
  if (!chat) return;
  const chatLog = chat.room.chatLog;
  return chatLog;
};
export const loadChatContent = async (name) => {
  if (!name || name === null) {
    const data = {
      result: false,
      message: "채팅 연결과정 중 오류가 발생했습니다.",
    };
    return data;
  }
  const chat = await ClientChat.findByUsername(name);
  if (chat === null) {
    const data = {
      result: false,
      message: "채팅 연결과정 중 오류가 발생했습니다.",
    };
    return data;
  }
  const managerId = chat.room.Member[1];
  let managerNickName = null;
  if (managerId) {
    const manager = await ManagerChat.findByUsername(managerId);
    managerNickName = manager.nickName;
  }
  const chatLog = chat.room.chatLog;
  const chatLastLog = chatLog[chat.room.chatLog.length - 1];
  const chatData = { chatLog, managerNickName, chatLastLog };
  return chatData;
};

export const saveMessage = async (user, message) => {
  const chat = await ClientChat.findByUsername(user);
  const chatLog = chat.room.chatLog;
  let chatLastSeq = 0;
  if (Object.keys(chatLog).length !== 0) {
    chatLastSeq = chatLog[chat.room.chatLog.length - 1].seq;
  }
  const time = createMsgTime();
  await chat.updateByChatLog(time, chatLastSeq, message, user);
  return time;
};
export const loadRoomName = async (user, socketId) => {
  if (user) {
    const client = await ClientChat.findByUsername(user);
    if (client === null) {
      const data = { result: false };
      return data;
    }
    const member = client.room.Member;

    const managerData = await ManagerChat.findBySocketId(socketId);
    if (managerData === null) {
      const data = { result: false };
      return data;
    }
    const managerId = managerData.managerId;
    // client의 room 상태
    const searchResult = searchMember(member, managerData.managerId);

    // 클라이언트 혼자일 경우
    if (!searchResult.result) {
      const member = await ClientChat.findByMember();
      const prevClientName = searchPrevClientName(member, managerId);
      // 매니저가 다른 방에서 채팅중이라면
      if (prevClientName !== null) {
        const prevClient = await ClientChat.findByUsername(prevClientName); // 이전 룸 유저 검색
        await prevClient.updateByChatMember(managerId, false); // 이전 클라이언트 db에서 매니저 퇴장
        const data = {
          result: "leave",
          roomName: prevClient.room.roomName, // socket.leave할 이전 룸 네임
        };
        return data;

        // 다른 방에서 채팅중이 아니었다면
      } else {
        const roomInfo = searchChatRoomInfo(managerData, user);
        await client.updateByChatMember(managerId, true);
        // 최초 상담받는 client
        if (!roomInfo) {
          await managerData.updateByJoiningChatRoom(user, client.room.roomName);
        }
        const data = {
          result: "join",
          roomName: client.room.roomName,
        };
        return data;
      }
    }
    // 클라이언트와 다른 매니저가 채팅 중
    if (searchResult.result && !searchResult.manager) {
      const data = {
        result: "another",
      };
      return data;
    }
    // 내가 이미 접속 중인 채팅 방
    if (searchResult.result && searchResult.manager) {
      const data = {
        result: "already",
        roomName: client.room.roomName,
      };
      return data;
    }
  } else {
    const data = { result: false };
    return data;
  }
};

export const reconnectRoom = async (socketId) => {
  const manager = await ManagerChat.findBySocketId(socketId);
  let name = false;
  if (manager !== null && manager.chatState === "on") {
    const client = await ClientChat.findByStatusChatting();
    for (let i = 0; i < client.length; i++) {
      const member = client[i].room.Member;
      const managerId = manager.managerId;
      const search = searchMember(member, managerId);
      if (search.result && search.manager) {
        name = search.name;
        break;
      } else {
        continue;
      }
    }
  }
  return name;
};

export const leaveRoom = async (user, socketId) => {
  const client = await ClientChat.findByUsername(user);
  if (client === null) {
    const data = { result: false };
    return data;
  }
  const managerData = await ManagerChat.findBySocketId(socketId);
  if (managerData === null) {
    const data = { result: false };
    return data;
  }
  const managerId = managerData.managerId;
  await client.updateByChatMember(managerId, false);
  const status = "waiting";
  await client.updateByStatus(status);
  const roomName = client.room.roomName;
  const data = { result: true, roomName };
  return data;
};

export const findUserType = async (clientId, userId) => {
  const oauth = await Oauth.findByClientId(clientId);
  if (oauth === null) {
    return false;
  }
  return findManagerId(oauth.client.chatManagerList, userId);
};