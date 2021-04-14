import fs from "fs";
import path from "path";

export const findSameId = (list, id) => {
  let data = false;

  for (let i = 0; i < list.length; i++) {
    if (list[i] === id) {
      data = list[i];

      break;
    }
  }

  return data;
};

export const filterSmpChatData = (smpChatDoc) => {
  return {
    state: (userId, type) => {
      let state = null;

      if (type === "manager") {
        for (let i = 0; i < smpChatDoc.manager.length; i++) {
          if (smpChatDoc.manager[i].managerId === userId) {
            state = smpChatDoc.manager[i].serverState;

            break;
          }
        }
      }
      if (type === "client") {
        for (let i = 0; i < smpChatDoc.client.length; i++) {
          if (smpChatDoc.client[i].userId === userId) {
            state = smpChatDoc.client[i].serverState;

            break;
          }
        }
      }

      return state;
    },
    recentStayRoomOwerId: (userId) => {
      for (let i = 0; i < smpChatDoc.manager.length; i++) {
        const managerDoc = smpChatDoc.manager[i];

        if (managerDoc.managerId === userId) {
          userId = managerDoc.stayRoomOwnerId;

          break;
        }
      }
      return userId;
    },
    recentSeq: (userId) => {
      let recentSeq = null;

      for (let i = 0; i < smpChatDoc.client.length; i++) {
        const clientDoc = smpChatDoc.client[i];

        if (clientDoc.userId === userId) {
          recentSeq = clientDoc.chatLog.length;

          break;
        }
      }

      return recentSeq;
    },
    recentChatLogs: (userList) => {
      const recentChatLogs = [];

      for (let i = 0; i < userList.length; i++) {
        for (let j = 0; j < smpChatDoc.client.length; j++) {
          const userId = smpChatDoc.client[j].userId;

          if (userList[i] === userId) {
            const chatLog = smpChatDoc.client[j].chatLog;

            recentChatLogs.push(chatLog[chatLog.length - 1]);

            break;
          }
        }
      }
      return recentChatLogs;
    },
    chatLog: (userId, dialogNum, lastDialogNum) => {
      let dialog = [];
      let clientLength = smpChatDoc.client.length;

      for (let i = 0; i < clientLength; i++) {
        if (smpChatDoc.client[i].userId === userId) {
          const chatLogLength =
            lastDialogNum === null
              ? smpChatDoc.client[i].chatLog.length
              : lastDialogNum - 1;
          let getLogNum = chatLogLength - dialogNum;

          if (getLogNum < 0) getLogNum = 0;

          for (let j = getLogNum; j < chatLogLength; j++) {
            const chatLog = smpChatDoc.client[i].chatLog[j];

            if (chatLog.image !== null && chatLog.message === null) {
              chatLog.image = fs.readFileSync(chatLog.image).toString("base64");
            }
            dialog.push(chatLog);
          }

          break;
        }
      }
      return dialog;
    },
    availChatClient: (userId) => {
      const client = smpChatDoc.client;
      for (let i = 0; i < client.length; i++) {
        if (client[i].server === "off") return;

        const member = client
          .map((list) => list.roomMember)
          .filter((currMember) => {
            if (currMember.length === 1) return currMember;

            if (currMember.length > 1) {
              const index = currMember.indexOf(userId);

              if (index === -1) return;

              return currMember;
            }
          })
          .map((roomMember) => roomMember[0]);

        return member;
      }
    },
    observeCount: (userId, type, roomName) => {
      if (type === "refresh") {
        let previewCount = {};
        let iconCount = 0;

        for (let i = 0; i < smpChatDoc.client.length; i++) {
          const client = smpChatDoc.client[i];

          if (client.serverState === "off") return;

          if (
            client.roomMember.length === 1 ||
            client.roomMember.indexOf(userId) !== -1
          ) {
            for (let j = client.chatLog.length - 1; j >= 0; j--) {
              const chatLog = client.chatLog[j];

              if (chatLog.observe) break;

              if (!chatLog.observe && chatLog.userId !== userId) {
                if (!previewCount[client.userId]) {
                  previewCount[client.userId] = 0;
                }

                previewCount[client.userId] = previewCount[client.userId] + 1;

                iconCount = iconCount + 1;
              }
            }
          }
        }
        return { previewCount, iconCount };
      }

      if (type === "message") {
        let count = 0;

        for (let i = 0; i < smpChatDoc.client.length; i++) {
          const client = smpChatDoc.client[i];

          if (client.userId === roomName) {
            for (let j = client.chatLog.length - 1; j >= 0; j--) {
              const chatLog = client.chatLog[j];

              if (chatLog.observe) break;

              if (!chatLog.observe && chatLog.userId === userId) {
                count = count + 1;
              }
            }
          }
        }
        return count;
      }
    },
    checkRoomMember: (userId, roomName) => {
      let state = null;
      for (let i = 0; i < smpChatDoc.client.length; i++) {
        const client = smpChatDoc.client[i];

        if (client.userId === roomName) {
          if (client.roomMember.length >= 2) {
            const index = client.roomMember.indexOf(userId);

            if (index === -1) {
              state = "chatting";

              break;
            }
          }
        }
      }
      return state;
    },
  };
};

export const saveImageFolderAndFile = (username, roomName, image) => {
  const dirPath = path.join(
    __dirname,
    `/../../data/smpChat/${username}/${roomName}`
  );
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const buffer = Buffer.from(image.bytes);

  const filename = `${dirPath}/${Date.now().toString()}_${image.name}`;

  fs.writeFileSync(filename, buffer);

  return { filename, buffer };
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

export const checkRefreshUser = (() => {
  let userState = [];
  let check = false;

  return ({ userId }, state) => {
    const userInfo = { userId, state };

    if (!userState) {
      userState.push(userInfo);

      return;
    }

    if (userState) {
      for (let i = 0; i < userState.length; i++) {
        if (userState[i].userId === userInfo.userId && state === "refresh") {
          check = true;
          userState[i].state = "off";

          return;
        }

        if (userState[i].userId === userInfo.userId && state === "access") {
          check = true;
          userState[i].state = "on";

          return;
        }

        if (userState[i].userId === userInfo.userId && state === "check") {
          check = true;

          return userState[i].state;
        }
      }

      if (!check) {
        userState.push(userInfo);

        return;
      }
    }
  };
})();

export const checkFunctionSpeed = (func, cnt, params) => {
  const startTime = new Date().getTime();
  const executeCount = cnt;

  for (let i = 0; i < executeCount; i++) {
    func(params);
  }
  const endTime = new Date().getTime();
  const elapsed = endTime - startTime;

  return elapsed;
};
