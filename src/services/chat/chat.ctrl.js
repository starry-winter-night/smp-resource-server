import moment from "moment-timezone";
import { findSameId, filterSmpChatData } from "./chat.functions";
import SmpChat from "../../models/smpChat";
import Member from "../../models/member";
import Oauth from "../../models/oauth";

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

export const judgeUserType = async (clientId, userId) => {
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

export const setServerState = async ({ clientId, userId, userType }, state) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  await SmpChat.updateByServerState(smpChat._id, userId, state, userType);

  return { result: true };
};

export const saveMessage = async (
  { clientId, userId, userType },
  message = null,
  image = null
) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const roomName =
    userType === "manager"
      ? filterSmpChatData(smpChat).recentStayRoomOwerId(userId)
      : userId;

  if (!roomName) return;

  const seq = filterSmpChatData(smpChat).recentSeq(roomName);
  const registerTime = moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm");
  const logArr = [];
  const smpChatLogInfo = {
    seq: seq + 1,
    userId,
    userType,
    message,
    image,
    registerTime,
    roomName,
  };

  await SmpChat.updateByMessage(smpChat._id, roomName, smpChatLogInfo);

  logArr.push(smpChatLogInfo);

  return logArr;
};

export const joinRoomMember = async (
  { clientId, userId, userType },
  clientName = null
) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  if (userType === "client" && clientName === null) {
    const userList = filterSmpChatData(smpChat).availChatClient(userId);

    if (userList.length === 1 && userList[0] === userId) return;

    await SmpChat.updateByRoomMember(smpChat._id, userId);
  }

  if (userType === "manager" && clientName) {
    // 순서 중요
    const prevUser = filterSmpChatData(smpChat).recentStayRoomOwerId(userId);

    await SmpChat.updateByStayRoomOwnerId(smpChat._id, clientName, userId);

    await SmpChat.updateByRoomMember(smpChat._id, clientName, userId);

    return prevUser;
  }
};

export const getPreview = async ({ clientId, userId }) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const userList = filterSmpChatData(smpChat).availChatClient(userId);

  if (userList.length === 0) return;

  const chatLogs = filterSmpChatData(smpChat).recentChatLogs(userList);

  if (chatLogs.length === 0) return;

  return chatLogs;
};

export const loadDialog = async ({ clientId, userId, userType }) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const clientName =
    userType === "manager"
      ? filterSmpChatData(smpChat).recentStayRoomOwerId(userId)
      : userId;
  const dialogNum = 15;
  const dialog = filterSmpChatData(smpChat).chatLog(clientName, dialogNum);

  if (dialog.length === 0) return;

  return dialog;
};

export const getClientName = async ({ clientId, userId }) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const clientName = filterSmpChatData(smpChat).recentStayRoomOwerId(userId);

  return clientName;
};
