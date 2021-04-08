import moment from "moment-timezone";
import {
  findSameId,
  filterSmpChatData,
  saveImageFolderAndFile,
} from "./chat.functions";
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
  let filename = null;
  let buffer = null;

  if (image !== null) {
    const member = await Member.findByClientId(clientId);
    image = saveImageFolderAndFile(member.username, roomName, image);
    filename = image.filename;
    buffer = image.buffer;
  }

  const logArr = [];
  const smpChatLogInfo = {
    seq: seq + 1,
    userId,
    userType,
    message,
    image: filename,
    registerTime,
    roomName,
    observe: false,
  };

  await SmpChat.updateByMessage(smpChat._id, roomName, smpChatLogInfo);

  if (image) smpChatLogInfo.image = buffer.toString("base64");

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

  if (chatLogs[0].image && chatLogs[0].message === null) {
    chatLogs[0].image = null;
    chatLogs[0].message = "사진을 보냈습니다.";
  }

  return chatLogs;
};

export const loadDialog = async (
  { clientId, userId, userType },
  seq = null
) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const clientName =
    userType === "manager"
      ? filterSmpChatData(smpChat).recentStayRoomOwerId(userId)
      : userId;

  const dialogNum = 15;
  const lastDialogNum = seq;
  const dialog = filterSmpChatData(smpChat).chatLog(
    clientName,
    dialogNum,
    lastDialogNum
  );

  return dialog;
};

export const getClientName = async ({ clientId, userId }) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  const clientName = filterSmpChatData(smpChat).recentStayRoomOwerId(userId);

  return clientName;
};

export const observeMessageCheck = async ({ clientId }, roomName) => {
  const smpChat = await SmpChat.findByClientId(clientId);

  if (!smpChat) return { result: false };

  roomName = [roomName];

  const chatLogs = filterSmpChatData(smpChat).recentChatLogs(roomName);

  if (chatLogs[0].observe) {
    return false;
  }
  await SmpChat.updateByObserve(smpChat._id, roomName, true);

  return true;
};

export const checkDuplicateUser = (() => {
  let accessUsers = [];

  return ({ userId, id }, arr = []) => {
    let message = "";
    let result = true;

    if (arr.length !== 0) {
      accessUsers = accessUsers.filter((user) => user.userId !== userId);
      message = "";
    } else {
      accessUsers.map((user) => {
        if (user.userId === userId) {
          message = "duplicate_connection";
          result = false;
        }
      });

      if (message === "") {
        accessUsers.push({ userId, socketId: id });
      }
    }

    return { accessUsers, message, result };
  };
})();

export const countMessageAlarm = (() => {
  let alarmInfo = {};

  return {
    increase: (userId) => {
      if (!alarmInfo[userId]) alarmInfo[userId] = 0;

      alarmInfo[userId] = alarmInfo[userId] + 1;

      return alarmInfo;
    },
    decrease: (userId) => {
      if (!alarmInfo[userId]) return;

      alarmInfo[userId] = 0;

      return alarmInfo;
    },
    currCount: () => {
      return alarmInfo;
    },
  };
})();
