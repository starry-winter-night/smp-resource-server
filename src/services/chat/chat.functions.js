export const createMeberList = async (clientInfo, user) => {
  let MemberArray = [];
  clientInfo.room.Member.map((member) => {
    // 단순 비교로 일단 배열에 모두 넣는다.
    if (member !== user) {
      MemberArray.push(member);
      MemberArray.push(user);
    } else {
      MemberArray.push(member);
    }
  });
  // 혹시 중복 되어있을 member를 제거한다.
  MemberArray = [...new Set(MemberArray)];

  const chatDialogNum = clientInfo.room.chatLog.length + 1;
  const data = {
    member: MemberArray,
    dialogNum: chatDialogNum,
  };
  return data;
};

export const searchMember = (member, managerId) => {
  let result = false;
  let manager = false;
  let name = null;

  // 클라이언트와 누군가가 접속중일 경우
  if (member.length > 1) {
    for (let i = 0; i < member.length; i++) {
      // 그 접속자가 '나'라면
      if (member[i] === managerId) {
        result = true;
        manager = true;
        name = member[i];
        break;
      } else {
        continue;
      }
    }
    // 매니저 이름 제거 후 유저 이름만 저장
    member.splice(member.indexOf(name), 1);
    name = member[0];
  }
  const data = {
    result,
    manager,
    name,
  };
  return data;
};

export const searchPrevClientName = (member, manager) => {
  let result = null;
  member.map((data) => {
    const index = data.room.Member.indexOf(manager);
    if (index === 1) {
      result = data.room.Member[0];
      return result;
    }
  });
  return result;
};

export const searchChatRoomInfo = (managerData, user) => {
  let result = false;

  managerData.JoiningChatRoom.map((data) => {
    if (data.clientName === user) {
      result = true;
    }
  });
  return result;
};

export const createMsgTime = () => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const currentDate = date.getDate();
  let currentHour = date.getHours();
  let currentMinutes = date.getMinutes();
  let currentSecond = date.getSeconds();

  if (currentHour < 10) {
    currentHour = `0${currentHour}`;
  }
  if (currentMinutes < 10) {
    currentMinutes = `0${currentMinutes}`;
  }
  if (currentSecond < 10) {
    currentSecond = `0${currentSecond}`;
  }

  const systemViewTime = `${currentYear}년 ${currentMonth}월 ${currentDate}일`;
  const messageViewTime = `${currentHour}:${currentMinutes}`;
  const currentTime = `${currentYear}-${currentMonth}-${currentDate} ${messageViewTime}:${currentSecond}`;

  const data = {
    systemViewTime,
    messageViewTime,
    currentTime,
  };
  return data;
};

export const loadLatestLog = (log) => {
  const message = log.room.chatLog[log.room.chatLog.length - 1].message;
  const user = log.room.chatLog[log.room.chatLog.length - 1].user;
  const simpleTime = log.room.chatLog[log.room.chatLog.length - 1].simpleTime;
  const data = {
    message,
    user,
    simpleTime,
  };
  return data;
};

export const findSameId = (list, id) => {
  let data = "";

  for (let i = 0; i < list.length; i++) {
    if (list[i] === id) {
      data = list[i];
      break;
    }
    data = false;
  }

  return data;
};

export const filterSmpChatData = (smpChatDoc) => {
  return {
    id: (userId, type) => {
      let idList = null;

      if (type === "manager") {
        idList = smpChatDoc.manager.map((list) => list.managerId);
      } else {
        idList = smpChatDoc.client.map((list) => list.userId);
      }

      if (idList.length === 0) return "nonExist";

      const id = findSameId(idList, userId);

      return id ? "exist" : "nonExist";
    },
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
    recentSeq: (userId) => {
      let recentSeq = null;

      for (let i = 0; i < smpChatDoc.client.length; i++) {
        if (smpChatDoc.client[i].userId === userId) {
          const doc = smpChatDoc.client[i];

          recentSeq = doc.chatLog.length + 1;

          break;
        }
      }

      return recentSeq;
    },
  };
};
