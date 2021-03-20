import {
  createMsgTime,
  searchMember,
  searchChatRoomInfo,
  searchPrevClientName,
  loadLatestLog,
  changeUTC,
  checkManagerId,
} from "./chat.functions";
import ManagerChat from "../../models/chatManager";
import ClientChat from "../../models/chatClient";
import SmpChat from "../../models/smpChat";
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

export const verifyClientId = async (clientId) => {
  const member = await Member.findByClientId(clientId);
  if (member === null) {
    return {
      result: false,
      code: 500,
      message: "등록된 CLIENTID가 아닙니다.",
    };
  }

  // 최초등록
  const info = await SmpChat.findByClientId(clientId);
  if (info === null) {
    const smpChat = new SmpChat({
      clientId,
      chatApiKey: member.client.chatApiKey,
    });

    await smpChat.save();
  }

  return { result: true };
};

export const judgeUser = async (clientId, userId) => {
  const oauth = await Oauth.findByClientId(clientId);

  if (oauth === null) {
    return false;
  }

  const idChecked = checkManagerId(oauth.client.chatManagerList, userId);
  let userType = "";

  if (!idChecked) {
    userType = "client";
  }

  userType = "manager";

  return userType;
};

export const registerManager = async (clientId, managerId) => {
  const info = await SmpChat.findByUsername(managerId);

  if (info === null && typeof managerId === "string") {
    const smpChat = await SmpChat.findByClientId(clientId);

    await smpChat.updateByServerState("off");
    await smpChat.updateByManagerIds(managerId);
  }
  return;
};

export const verifyManagerInfo = async (clientId, apiKey) => {
  const info = await SmpChat.findByChatApiKey(apiKey);

  if (info === null) {
    return { message: "apiKey가 일치하지 않습니다.", result: false };
  }

  if (info.clientId !== clientId) {
    return { message: "clientId가 일치하지 않습니다.", result: false };
  }

  return { result: true };
};

export const getServerState = async (managerId) => {
  const info = await SmpChat.findByUsername(managerId);
  return info.serverState;
};

export const setServerState = async (clientId, order) => {
  const info = await SmpChat.findByClientId(clientId);
  const state = order ? "on" : "off";

  await info.updateByServerState(state);

  return;
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
