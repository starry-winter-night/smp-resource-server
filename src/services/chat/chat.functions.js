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

export const changeUTC = (op) => {
  const now = new Date();
  let utcTime = {
    startDate: Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      op.startTime.hour,
      op.startTime.minute,
      op.startTime.second
    ),
    endDate: Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      op.endTime.hour,
      op.endTime.minute,
      op.endTime.second
    ),
  };

  utcTime.startDate = utcTime.startDate - 3600000 * 9;
  utcTime.endDate = utcTime.endDate - 3600000 * 9;

  if (isNaN(utcTime.startDate) || isNaN(utcTime.endDate)) {
    utcTime = false;
  }
  return utcTime;
};

export const checkManagerId = (managerList, userId) => {
  let managerId = "";

  for (let i = 0; i < managerList.length; i++) {
    if (managerList[i] === userId) {
      managerId = managerList[i];
      break;
    }
    managerId = false;
  }

  return managerId;
};
