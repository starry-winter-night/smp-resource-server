import moment from "moment-timezone";
import {
  createMsgTime,
  searchMember,
  searchChatRoomInfo,
  searchPrevClientName,
  checkFunctionSpeed,
  changeUTC,
  findSameId,
  filterSmpChatData,
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
      registerTime: moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm"),
    });

    await smpChat.save();
  }

  return { result: true };
};

export const judgeUser = async (clientId, userId) => {
  const oauth = await Oauth.findByClientId(clientId);

  if (oauth === null) return "oauth null";

  const managerList = oauth.client.chatManagerList;

  if (managerList.length === 0) return "managerList null";

  const id = findSameId(managerList, userId);
  const userType = !id ? "client" : "manager";

  return userType;
};

export const registerManager = async (clientId, userId, userType) => {
  const getIds = await SmpChat.findByUserId(clientId, userId, userType);

  if (getIds === null) {
    const regTime = moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
    const serverState = "off";

    const smpChat = await SmpChat.findByClientId(clientId);
    await smpChat.updateByIdAndState(userId, serverState, regTime, userType);
  }

  return;
};

export const verifyManagerInfo = async (clientId, apiKey) => {
  const smpChat = await SmpChat.findByChatApiKey(apiKey);

  if (smpChat === null) {
    return { message: "apiKey가 일치하지 않습니다.", result: false };
  }

  if (smpChat.clientId !== clientId) {
    return { message: "clientId가 일치하지 않습니다.", result: false };
  }

  return { result: true };
};

export const getServerState = async (clientId, userId, userType) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  return filterSmpChatData(smpChat).state(userId, userType);
};

export const setServerState = async (clientId, userId, state, userType) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  await SmpChat.updateByServerState(smpChat._id, userId, state, userType);

  return { result: true };
};

export const saveMessage = async (
  clientId,
  userId,
  message,
  image,
  userType
) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const registerTime = moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
  const seq = filterSmpChatData(smpChat).recentSeq(userId);
  const manager = userType === "manager" ? true : false;
  const logArr = [];
  const smpChatLogInfo = {
    seq,
    userId,
    manager,
    message,
    image,
    registerTime,
  };

  logArr.push(smpChatLogInfo);

  await SmpChat.updateByMessage(smpChat._id, smpChatLogInfo);

  return logArr;
};

export const joinRoomMember = async (clientId, userId, userType) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  if (userType === "client") {
    await SmpChat.updateByRoomMember(smpChat._id, userId);
  }

  if (userType === "manager") {
  }
};

export const getPreview = async (clientId) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const userList = filterSmpChatData(smpChat).requestChatUsers();
  const chatLogs = filterSmpChatData(smpChat).recentChatLogs(userList);

  if (chatLogs.length === 0) return;

  return chatLogs;
};

export const loadDialog = async (clientId, userId) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };
  
  const dialogNum = 15;
  const dialog = filterSmpChatData(smpChat).chatLog(userId, dialogNum);

  if (dialog.length === 0) return;

  return dialog;
};
