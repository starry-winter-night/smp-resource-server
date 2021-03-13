class SetChat {
  // 채팅 쓰겠다고 하면 코드 만들어서 주고 클라이언트 아이디 대신 받아도 될듯 하다.
  constructor(clientId, managerName) {
    this.clientId = clientId;
    this.managerName = managerName;
  }
  // 첫 클라이언트 id 등록 및 새로고침시 실행되는 함수
  setClientId() {
    localStorage.setItem(`clientId`, this.clientId);
    localStorage.setItem(`managerName`, this.managerName);

    // 클라이언트ID가 등록된 상태
    // 최초의 state는 off가 default
    fetch(`http://localhost:5000/chat?CLIENTID=${this.clientId}`)
      .then((response) => response.text())
      .then((data) => {
        data = JSON.parse(data);
        // 최초의 off
        if (data.state === "off") {
          // document.getElementById("chatSwitch").checked = false;
          switchSpan.style.backgroundColor = "#ccc";
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "position:absolute;"
          );
          document.styleSheets[0].addRule(".switchSpan:before", 'content:"";');
          document.styleSheets[0].addRule(".switchSpan:before", "height:22px;");
          document.styleSheets[0].addRule(".switchSpan:before", "width:22px;");
          document.styleSheets[0].addRule(".switchSpan:before", "left:4px;");
          document.styleSheets[0].addRule(".switchSpan:before", "bottom:4px;");
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "background-color:#fff;"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "-webkit-transition: .4s;"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "transition: .4s;"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "-webkit-transform: translateX(0);"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "-ms-transform: translateX(0);"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "transform: translateX(0);"
          );
          switchOffP.style.display = "inline";
          switchOnP.style.display = "none";
          return;
        }
        if (data.state === "on") {
          switchSpan.style.backgroundColor = "#2196F3";
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "-webkit-transform: translateX(30px);"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "-ms-transform: translateX(30px);"
          );
          document.styleSheets[0].addRule(
            ".switchSpan:before",
            "transform: translateX(30px);"
          );
          switchOffP.style.display = "none";
          switchOnP.style.display = "inline";
          document.getElementById("chatSwitch").checked = true;
          managerServerConnect(data);
          return;
        }
      });
  }
}
// 관리자 서버 커넥트 // checkBox가 on일때만 들어온다.
const managerServerConnect = (check) => {
  const clientId = localStorage.getItem("clientId");
  const managerName = localStorage.getItem("managerName");

  if (!clientId || clientId === null) {
    alert("clientId가 누락되었습니다. 새로고침 또는 재로그인 해주세요.");
  }
  if (!managerName || managerName === null) {
    alert("관리자 이름이 누락되었습니다. 새로고침 또는 재로그인 해주세요.");
  }
  let state = "off";
  if (check) state = "on";

  // off -> on
  // state의 update
  fetch(`http://localhost:5000/chat?CLIENTID=${clientId}&STATE=${state}`)
    .then((response) => response.text())
    .then((data) => {
      data = JSON.parse(data);
      const socket = io(`ws://localhost:7000/${clientId}`);
      socket.on("connect", () => {
        if (data.state === "on") {
          console.log(data.message);
        } else {
          socket.emit("close");
        }
      });
      socket.on("disconnect", (data) => {
        console.log(data); 
      });
      socket.emit("alarm", { managerName });

      socket.on("managerReconnect", (data) => {
        const name = data.name;
        socket.emit("managerReJoin", { name });
        managerSendMessage(socket, managerName, name);
        return;
      });

      socket.on("preview", (data) => {
        if (data.collection) {
          data.collection.map((data) => {
            if (data) {
              chatPreview(
                data.username,
                data.chatLog.simpleTime,
                data.chatLog.message
              );
              clientDialogLogic(socket, data.username, managerName, clientId);
            }
          });
        } else {
          chatPreview(data.name, data.time, data.message);
          clientDialogLogic(socket, data.name, managerName, clientId);
        }
        return;
      });

      socket.on("message", (data) => {
        switch (data.type) {
          case "managerDialog":
            if (data.name) {
              titleH3.getElementsByTagName("span")[0].innerHTML = data.name;
            }
            const dialog = data.chatLog;
            deleteDialog();
            dialog.map((log) => {
              chatUserDialog(
                managerName,
                log.user,
                log.message,
                log.simpleTime,
                "dialogDiv"
              );
            });
            return;
          case "message":
            chatUserDialog(
              managerName,
              data.manager,
              data.message,
              data.time,
              "dialogDiv"
            );
            return;
          default:
            break;
        }
      });
    });
};

const managerSendMessage = (socket, managerName, username) => {
  messageButton.onclick = () => {
    socket.emit("message", {
      message: messageInput.value,
      manager: managerName,
      username: username,
    });
    messageInput.value = "";
    messageInput.focus();
  };
  messageInput.onkeyup = (e) => {
    // only enter
    if (e.which === 13 && !e.ctrlKey) {
      if (!messageButton.disabled) {
        socket.emit("message", {
          message: messageInput.value,
          manager: managerName,
          username: username,
        });
        messageInput.value = "";
        e.preventDefault();
        return;
      } else {
        e.preventDefault();
        return;
      }
    }
  };
};

const deleteDialog = () => {
  const dialogDiv = document.getElementById("dialogDiv");
  while (dialogDiv.firstChild) {
    dialogDiv.removeChild(dialogDiv.lastChild);
  }
};
const clientDialogLogic = (socket, name, managerName, clientId) => {
  const chatList = document.getElementById(`chatList:${name}`);
  chatList.onclick = () => {
    const chatUser = document.getElementById(`chatUser:${name}`);
    const username = chatUser.innerHTML;

    if (name === username) {
      socket.emit("roomEnterExit", { name, clientId });
      managerSendMessage(socket, managerName, name);
    }
  };
};

// 스타일 적용

//font
const newFontMavenPro = document.createElement("style");
newFontMavenPro.textContent = `@font-face { font-family: 'Maven Pro', src: url(https://fonts.gstatic.com/s/mavenpro/v21/7Auup_AqnyWWAxW2Wk3swUz56MS91Eww8SX21nijogp5.woff2) format('woff2');  font-weight: 400; font-style: normal; }`;
document.head.appendChild(newFontMavenPro);

const newFontTmoneyRoundWind2 = document.createElement("style");
newFontTmoneyRoundWind2.textContent = `@font-face { font-family: 'TmoneyRoundWindRegular'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindRegular.woff') format('woff'); font-weight: normal; font-style: normal; }`;
document.head.appendChild(newFontTmoneyRoundWind2);

//scroll bar
const styleDom = document.createElement("style");
styleDom.textContent = `
.chatScrollbar::-webkit-scrollbar{
  width:6px;
}
.chatScrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
.chatScrollbar::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #ccc;
}
.chatScrollbar::-webkit-scrollbar-button {
  width: 0;
  height: 0;
}
.chatScrollbar{scrollbar-width: thin;}`; // firefox 스크롤바 css
document.head.appendChild(styleDom);

//text drag do not
const drag = document.createElement("style");
drag.textContent = `
.no-drag {-ms-user-select: none; 
-moz-user-select: -moz-none; 
-webkit-user-select: none; 
-khtml-user-select: none; 
user-select:none;}`;
document.head.appendChild(drag);

// 관리자의 채팅창
const chatBox = document.getElementById("chatBox");
if (chatBox) {
  const chatBoxImg = document.createElement("IMG");
  chatBoxImg.setAttribute(
    "src",
    `http://localhost:5000/chat/image?name=chat.png`
  );
  chatBoxImg.setAttribute("alt", "chatBoxImage");
  chatBoxImg.style.setProperty("width", "65px", "important");
  chatBoxImg.style.setProperty("height", "70px", "important");
  chatBoxImg.style.setProperty("position", "absolute", "important");
  chatBoxImg.style.setProperty("top", "0", "important");
  chatBoxImg.style.setProperty("right", "0", "important");
  chatBoxImg.style.setProperty("left", "0", "important");
  chatBoxImg.style.setProperty("bottom", "0", "important");
  chatBoxImg.style.setProperty("cursor", "pointer", "important");
  chatBoxImg.style.setProperty("transform", "none", "important");
  chatBox.append(chatBoxImg);
  chatBox.style.setProperty("position", "fixed", "important");
  chatBox.style.setProperty("bottom", "0", "important");
  chatBox.style.setProperty("right", "0", "important");
  chatBox.style.setProperty("width", "100px", "important");
  chatBox.style.setProperty("height", "100px", "important");
  chatBox.style.setProperty("margin", "0px", "important");
  chatBox.style.setProperty("z-index", "99999", "important");

  chatBoxImg.onclick = () => {
    const chatDiv = document.getElementById("chatDiv");
    chatBoxImg.classList.toggle("chatBoxActive");
    chatCloseImg.onclick = () => {
      chatBoxImg.classList.toggle("chatBoxActive");
      chatBoxImg.style.setProperty("display", "block", "important");
      chatDiv.style.setProperty("display", "none", "important");
      chatBox.style.setProperty("position", "fixed", "important");
      chatBox.style.setProperty("bottom", "0", "important");
      chatBox.style.setProperty("right", "0", "important");
      chatBox.style.setProperty("width", "100px", "important");
      chatBox.style.setProperty("height", "100px", "important");
      chatBox.style.setProperty("margin", "0px", "important");
      chatBox.style.setProperty("z-index", "99999", "important");
    };
    chatDiv.style.setProperty("display", "block", "important");
    chatBoxImg.style.setProperty("display", "none", "important");
    chatBox.style.setProperty("width", "850px", "important");
    chatBox.style.setProperty("height", "600px", "important");
  };
}

const div = document.createElement("div");
div.id = "chatDiv";

// position: fixed !important;
//     bottom: 0px !important;
//     right: 0px !important;
//     width: 300px !important;
//     height: 300px !important;
//     animation: 0.5s ease-out 0s 1 normal none running eMLfYp !important;
//     background: radial-gradient(at right bottom, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0) 72%) !important;
div.style.display = "none";
div.style.width = "100%";
div.style.backgroundColor = "#fff";
div.style.margin = "0 auto";
div.style.height = "550px";
div.style.lineHeight = "550px";
div.style.backgroundColor = "#6495ed";
div.style.borderRadius = "20px";

const managerDiv = document.createElement("div");
managerDiv.className = "managerDiv";
div.appendChild(managerDiv);

managerDiv.style.width = "37.5%";
managerDiv.style.marginLeft = "2.5%";
managerDiv.style.backgroundColor = "#1E90FF";
managerDiv.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
managerDiv.style.height = "500px";
managerDiv.style.display = "inline-block";
managerDiv.style.verticalAlign = "middle";
managerDiv.style.position = "relative";

const connectDiv = document.createElement("div");
connectDiv.className = "connectDiv";
managerDiv.appendChild(connectDiv);
const connectH3 = document.createElement("h3");
connectH3.className = "no-drag";
const connectText = document.createTextNode("Connect to Chat Server : ");
connectH3.appendChild(connectText);
connectDiv.appendChild(connectH3);

connectDiv.style.width = "60%";
connectDiv.style.height = "50px";
connectDiv.style.lineHeight = "50px";
connectDiv.style.display = "inline-block";
connectDiv.style.borderBottom = "1px solid #ccc";
connectDiv.style.margin = "0 0 0 10%";
connectDiv.style.verticalAlign = "top";

connectH3.style.fontFamily = "Maven Pro, sans-serif";
connectH3.style.margin = "0";
connectH3.style.verticalAlign = "middle";
connectH3.style.height = "50px";
connectH3.style.lineHeight = "50px";
connectH3.style.fontSize = "1.11em";
connectH3.style.fontWeight = "600";
connectH3.style.color = "#696969";

// radio 버튼
const radioDiv = document.createElement("div");
radioDiv.className = "radioDiv";
managerDiv.appendChild(radioDiv);

radioDiv.style.width = "20%";
radioDiv.style.height = "50px";
radioDiv.style.lineHeight = "50px";
radioDiv.style.textAlign = "right";
radioDiv.style.display = "inline-block";
radioDiv.style.borderBottom = "1px solid #ccc";
radioDiv.style.margin = "0 10% 0 0";
radioDiv.style.verticalAlign = "top";

// checkBox
const switchLabel = document.createElement("LABEL");
const switchSpan = document.createElement("span");
const startInput = document.createElement("input");
startInput.type = "checkbox";
startInput.id = "chatSwitch";

switchLabel.appendChild(startInput);
switchLabel.appendChild(switchSpan);
switchSpan.className = "switchSpan round";

switchSpan.style.position = "absolute";
switchSpan.style.cursor = "pointer";
switchSpan.style.top = "0";
switchSpan.style.left = "0";
switchSpan.style.right = "0";
switchSpan.style.bottom = "0";
switchSpan.style.backgroundColor = "#ccc";
switchSpan.style.webkitTransition = ".4s";
switchSpan.style.transition = ".4s";

switchLabel.style.position = "relative";
switchLabel.style.display = "inline-block";
switchLabel.style.width = "60px";
switchLabel.style.height = "30px";
switchLabel.style.verticalAlign = "middle";
switchLabel.style.margin = "0";

startInput.style.opacity = "0";
startInput.style.width = "0";
startInput.style.height = "0";

const switchOffP = document.createElement("p");
const switchOff = document.createTextNode("OFF");
switchOffP.appendChild(switchOff);
const switchOnP = document.createElement("p");
const switchOn = document.createTextNode("ON");

switchOnP.appendChild(switchOn);
switchSpan.appendChild(switchOffP);
switchSpan.appendChild(switchOnP);

switchOffP.style.position = "absolute";
switchOffP.style.bottom = "-10px";
switchOffP.style.left = "30px";
switchOffP.style.fontSize = "12px";
switchOffP.style.color = "#fff";
switchOffP.style.userSelect = "none";
switchOffP.style.khtmlUserSelect = "none";
switchOffP.style.webkitUserSelect = "none";
switchOffP.style.mozUserSelect = "none";
switchOffP.style.msUserSelect = "none";

switchOnP.style.position = "absolute";
switchOnP.style.bottom = "-10px";
switchOnP.style.right = "32px";
switchOnP.style.fontSize = "12px";
switchOnP.style.color = "#fff";
switchOnP.style.userSelect = "none";
switchOnP.style.khtmlUserSelect = "none";
switchOnP.style.webkitUserSelect = "none";
switchOnP.style.mozUserSelect = "none";
switchOnP.style.msUserSelect = "none";

switchOnP.style.display = "none";
document.styleSheets[0].addRule(".radioDiv p", "margin:0px;");
document.styleSheets[0].addRule(".radioDiv p", "display:inline-block;");
document.styleSheets[0].addRule(".radioDiv p", "font-size:15px;");
document.styleSheets[0].addRule(".radioDiv p", "font-weight:bold;");

document.styleSheets[0].addRule(".switchSpan:before", "position:absolute;");
document.styleSheets[0].addRule(".switchSpan:before", 'content:"";');
document.styleSheets[0].addRule(".switchSpan:before", "height:22px;");
document.styleSheets[0].addRule(".switchSpan:before", "width:22px;");
document.styleSheets[0].addRule(".switchSpan:before", "left:4px;");
document.styleSheets[0].addRule(".switchSpan:before", "bottom:4px;");
document.styleSheets[0].addRule(".switchSpan:before", "background-color:#fff;");
document.styleSheets[0].addRule(
  ".switchSpan:before",
  "-webkit-transition: .4s;"
);
document.styleSheets[0].addRule(".switchSpan:before", "transition: .4s;");

document.styleSheets[0].addRule(".round", "border-radius: 30px;");
document.styleSheets[0].addRule(".round:before", "border-radius: 50%;");

startInput.addEventListener("focus", function () {
  switchSpan.style.boxShadow = "0 0 1px #2196F3";
});

radioDiv.appendChild(switchLabel);

// 클릭한 경우
startInput.onclick = function () {
  const check = startInput.checked;
  if (check) {
    switchSpan.style.backgroundColor = "#2196F3";
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "-webkit-transform: translateX(30px);"
    );
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "-ms-transform: translateX(30px);"
    );
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "transform: translateX(30px);"
    );
    switchOffP.style.display = "none";
    switchOnP.style.display = "inline";
    //서버 연결
    managerServerConnect(check);
  } else {
    switchSpan.style.backgroundColor = "#ccc";
    document.styleSheets[0].addRule(".switchSpan:before", "position:absolute;");
    document.styleSheets[0].addRule(".switchSpan:before", 'content:"";');
    document.styleSheets[0].addRule(".switchSpan:before", "height:22px;");
    document.styleSheets[0].addRule(".switchSpan:before", "width:22px;");
    document.styleSheets[0].addRule(".switchSpan:before", "left:4px;");
    document.styleSheets[0].addRule(".switchSpan:before", "bottom:4px;");
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "background-color:#fff;"
    );
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "-webkit-transition: .4s;"
    );
    document.styleSheets[0].addRule(".switchSpan:before", "transition: .4s;");
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "-webkit-transform: translateX(0);"
    );
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "-ms-transform: translateX(0);"
    );
    document.styleSheets[0].addRule(
      ".switchSpan:before",
      "transform: translateX(0);"
    );
    switchOffP.style.display = "inline";
    switchOnP.style.display = "none";
    managerServerConnect(check);
  }
};

// 채팅 요구 리스트
const listDiv = document.createElement("div");
listDiv.id = "listDiv";
managerDiv.appendChild(listDiv);

listDiv.style.width = "100%";
listDiv.style.height = "450px";
listDiv.style.position = "absolute";
listDiv.style.top = "50px";

// 공통 채팅창
const clientDiv = document.createElement("div");
clientDiv.id = "clientDiv";
div.appendChild(clientDiv);

clientDiv.style.width = "57.5%";
clientDiv.style.marginRight = "2.5%";
clientDiv.style.backgroundColor = "#fff";
clientDiv.style.height = "500px";
clientDiv.style.lineHeight = "20px";
clientDiv.style.display = "inline-block";
clientDiv.style.verticalAlign = "middle";

// 제목 div
const titleDiv = document.createElement("div");
titleDiv.className = "titleDiv";
clientDiv.appendChild(titleDiv);

titleDiv.style.width = "80%";
titleDiv.style.height = "50px";
titleDiv.style.lineHeight = "50px";
titleDiv.style.margin = "0 auto";
titleDiv.style.borderBottom = "1px solid #ddd";

// 제목 text
const titleH3 = document.createElement("h3");
titleH3.id = "titleH3";
titleH3.className = "no-drag";
titleDiv.appendChild(titleH3);
const titleText = document.createTextNode("online_");
const titleSpan = document.createElement("span");
titleSpan.id = "titleSpan";
titleH3.appendChild(titleText);
titleH3.appendChild(titleSpan);

titleH3.style.display = "inline";
titleH3.style.verticalAlign = "middle";
titleH3.style.fontFamily = "Maven Pro, sans-serif";
titleH3.style.fontSize = "1.2em";
titleH3.style.color = "#999";
titleSpan.style.color = "#1E90FF";
titleSpan.style.fontFamily = "Maven Pro, sans-serif";
titleSpan.style.fontWeight = "600";
titleSpan.style.fontSize = "1.5em";

// Close text
const titleP = document.createElement("p");
titleP.className = "titleP";
titleDiv.appendChild(titleP);
// const closeX = document.createTextNode("x");
// titleP.appendChild(closeX);

titleP.style.display = "inline";
titleP.style.margin = "0";

const chatCloseImg = document.createElement("IMG");
chatCloseImg.setAttribute(
  "src",
  `http://localhost:5000/chat/image?name=Xicon.png`
);
chatCloseImg.setAttribute("alt", "chatCloseButtonImage");
chatCloseImg.id = "chatCloseImg";
chatCloseImg.style.width = "15px";
chatCloseImg.style.height = "15px";
chatCloseImg.style.margin = "0";
chatCloseImg.style.position = "absolute";
chatCloseImg.style.top = "9%";
chatCloseImg.style.right = "5%";
chatCloseImg.style.cursor = "pointer";

titleDiv.appendChild(chatCloseImg);

// 내용 div
const contentDiv = document.createElement("div");
contentDiv.className = "contentDiv";
clientDiv.appendChild(contentDiv);

const dialogDiv = document.createElement("div");
dialogDiv.id = "dialogDiv";
dialogDiv.className = "chatScrollbar";
contentDiv.appendChild(dialogDiv);

dialogDiv.style.width = "100%";
dialogDiv.style.height = "390px";
dialogDiv.style.margin = "0 auto";
dialogDiv.style.padding = "15px 10% 0 10%";
dialogDiv.style.overflowY = "auto";

dialogDiv.scrollTop = dialogDiv.scrollHeight;

// 보내기 div
const footerDiv = document.createElement("div");
footerDiv.id = "footerDiv";
contentDiv.appendChild(footerDiv);

footerDiv.style.width = "80%";
footerDiv.style.margin = "0 auto";
footerDiv.style.height = "60px";
footerDiv.style.lineHeight = "60px";
footerDiv.style.textAlign = "center";
footerDiv.style.borderTop = "1px solid #ccc";

// 채팅 입력창
const messageInput = document.createElement("TEXTAREA");
messageInput.id = "messageInput";
messageInput.className = "chatScrollbar";
messageInput.cols = "40";
messageInput.rows = "1";

footerDiv.appendChild(messageInput);

messageInput.style.width = "75%";
messageInput.style.margin = "0 2.5% 0 0";
messageInput.style.padding = "0 0 0 3%";
messageInput.style.maxHeight = "210px";
messageInput.style.minHeight = "30px";
messageInput.style.lineHeight = "30px";
messageInput.style.verticalAlign = "middle";
messageInput.style.border = "1px solid #ddd";
messageInput.style.borderRadius = "15px";
messageInput.style.overflowY = "hidden";
messageInput.style.fontFamily = "TmoneyRoundWindRegular, sans-serif";
messageInput.style.resize = "none";
messageInput.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
messageInput.addEventListener("focus", function () {
  this.style.outline = "#ccc";
});

// 채팅 보내기 버튼
const messageButton = document.createElement("BUTTON");
messageButton.id = "messageButton";
const sendButton = document.createTextNode("전송");
messageButton.appendChild(sendButton);
footerDiv.appendChild(messageButton);

messageButton.style.width = "75px";
messageButton.style.margin = "0 0 0 2.5%";
messageButton.style.height = "30px";
messageButton.style.lineHeight = "30px";
messageButton.style.verticalAlign = "middle";
messageButton.style.backgroundColor = "#1E90FF";
messageButton.style.color = "#fff";
messageButton.style.border = "1px solid #ccc";
messageButton.style.opacity = "0.7";
messageButton.addEventListener("focus", function () {
  this.style.border = "1px solid #888";
  this.style.outline = "#888";
});

// chatBox에 적용
const chatBoxDiv = document.getElementById("chatBox");
if (chatBoxDiv !== null) {
  chatBoxDiv.appendChild(div);
}

class SetClientChat {
  // 채팅 쓰겠다고 하면 코드 만들어서 주고 클라이언트 아이디 대신 받아도 될듯 하다.
  constructor(clientId, chatApiKey, clientName) {
    this.clientId = clientId;
    this.chatApiKey = chatApiKey;
    this.clientName = clientName;
  }
  setClientId() {
    localStorage.setItem(`clientId`, this.clientId);
    localStorage.setItem(`chatApiKey`, this.chatApiKey);
    localStorage.setItem(`clientName`, this.clientName);

    if (!this.clientId || this.clientId === null) {
      console.log(
        "clientId가 누락되었습니다. 새로고침 또는 재로그인 해주세요."
      );
      return;
    }
    if (!this.chatApiKey || this.chatApiKey === null) {
      console.log(
        "chatApiKey가 누락되었습니다. 새로고침 또는 재로그인 해주세요."
      );
      return;
    }
    if (!this.clientName || this.clientName === null) {
      console.log("고객명이 누락되었습니다. 새로고침 또는 재로그인 해주세요.");
      return;
    }
    fetch(`http://localhost:5000/chat?CLIENTID=${this.clientId}`)
      .then((response) => response.text())
      .then((data) => {
        data = JSON.parse(data)
        if (data.state === "on") {
          const socket = io(
            `ws://localhost:7000/${this.clientId}?chatApiKey=${this.chatApiKey}`
          );

          socket.on("connect", () => {
            console.log("Customer Successfully Connected to Server!");
          });
          socket.on("disconnect", (data) => {
            console.log(data);
          });
          socket.on("clientReconnect", () => {
            socket.emit("joinRoom", { username: this.clientName });
            return;
          });

          socket.emit("joinRoom", { username: this.clientName });

          socket.on("message", (data) => {
            switch (data.type) {
              case "system":
                return;
              case "message":
                chatUserDialog(
                  data.manager,
                  data.name,
                  data.message,
                  data.time,
                  "dialogDiv2"
                );
                return;
              // case "preview":
              //   if (data.collection) {
              //     data.collection.map((data) => {
              //       if (data) {
              //         chatPreview(data.user, data.simpleTime, data.message);
              //       }
              //     });
              //   } else {
              //     chatPreview(data.name, data.time, data.message);
              //   }
              //   return;
              case "dialog":
                const dialog = data.chatLog;
                dialog.map((log) => {
                  chatUserDialog(
                    data.name,
                    log.user,
                    log.message,
                    log.simpleTime,
                    "dialogDiv2"
                  );
                });
                return;
              default:
                break;
            }
          });
          clientSendMessage(socket, this.clientName);
        } else {
          clientConnectAlert();
        }
      });
  }
}
const clientConnectAlert = () => {
  const systemLogDiv = document.getElementById("dialogDiv2");
  const systemLog = document.createElement("div");
  systemLog.style.width = "75%";
  systemLog.style.display = "block";
  systemLog.style.textAlign = "center";
  systemLog.style.margin = "0 auto";
  const systemLogP = document.createElement("p");
  systemLogP.style.background = "#ccc";
  systemLogP.style.borderRadius = "25px";
  systemLogP.style.height = "25px";
  systemLogP.style.lineHeight = "25px";
  systemLogP.style.color = "#555";

  const systemLogMsg = document.createTextNode("상담 가능 시간이 아닙니다.");
  systemLogDiv.appendChild(systemLog);
  systemLogP.appendChild(systemLogMsg);
  systemLog.appendChild(systemLogP);
};
const clientSendMessage = (socket, username) => {
  messageButton2.onclick = () => {
    socket.emit("message", {
      message: messageInput2.value,
      username: username,
    });
    messageInput2.value = "";
    messageInput2.focus();
  };
  messageInput2.onkeyup = (e) => {
    // only enter
    if (e.which === 13 && !e.ctrlKey) {
      if (!messageButton2.disabled) {
        socket.emit("message", {
          message: messageInput2.value,
          username: username,
        });
        messageInput2.value = "";
        e.preventDefault();
        return;
      } else {
        e.preventDefault();
        return;
      }
    }
  };
};

const isEmpty = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    (value !== null && typeof value === "object" && !Object.keys(value).length)
  ) {
    return true;
  } else {
    // only 빈칸 검사
    if (value.replace(/\s/g, "").length === 0) {
      return true;
    }
    return false;
  }
};

const scrollBottom = (objDiv) => {
  if (objDiv.scrollHeight === 0) {
    let findHeight = setInterval(() => {
      objDiv.scrollTop = objDiv.scrollHeight;
      if (objDiv.scrollHeight !== 0) {
        clearInterval(findHeight);
      }
    }, 0);
  } else {
    objDiv.scrollTop = objDiv.scrollHeight;
  }
};

const chatUserDialog = (user, logUser, message, time, dialogId) => {
  const dialogDiv = document.getElementById(`${dialogId}`);

  const clientLog = document.createElement("div");
  clientLog.style.width = "75%";
  clientLog.style.display = "inline-block";
  clientLog.style.textAlign = "right";
  clientLog.style.margin = "0 0 0 25%";
  const clientLogP = document.createElement("p");
  clientLogP.style.maxWidth = "87%";
  clientLogP.style.display = "inline-block";
  clientLogP.style.backgroundColor = "#1E90FF";
  clientLogP.style.borderRadius = "10px";
  clientLogP.style.padding = "7px 7px 3.5px 7px";
  clientLogP.style.color = "#fff";
  clientLogP.style.margin = "0";
  clientLogP.style.textAlign = "left";
  clientLogP.style.whiteSpace = "pre-line";
  const clientTimeP = document.createElement("p");
  clientTimeP.style.width = "13%";
  clientTimeP.style.display = "inline-block";
  clientTimeP.style.margin = "0";
  clientTimeP.style.color = "#999";
  clientTimeP.style.textAlign = "right";
  clientTimeP.style.padding = "7px 5px 7px 0";
  clientTimeP.style.verticalAlign = "text-top";
  clientTimeP.style.fontSize = "0.8em";
  const someoneLog = document.createElement("div");
  someoneLog.style.width = "75%";
  someoneLog.style.display = "inline-block";
  someoneLog.style.textAlign = "left";
  someoneLog.style.margin = "0 25% 0 0";
  const someoneLogP = document.createElement("p");
  someoneLogP.style.maxWidth = "87%";
  someoneLogP.style.display = "inline-block";
  someoneLogP.style.backgroundColor = "#F4F9FE";
  someoneLogP.style.borderRadius = "10px";
  someoneLogP.style.padding = "7px 7px 3.5px 7px";
  someoneLogP.style.color = "#696969";
  someoneLogP.style.margin = "0";
  someoneLogP.style.textAlign = "left";
  someoneLogP.style.whiteSpace = "pre-line";
  const someoneTimeP = document.createElement("p");
  someoneTimeP.style.width = "13%";
  someoneTimeP.style.display = "inline-block";
  someoneTimeP.style.margin = "0";
  someoneTimeP.style.color = "#999";
  someoneTimeP.style.textAlign = "right";
  someoneTimeP.style.padding = "7px 5px 7px 0";
  someoneTimeP.style.verticalAlign = "text-top";
  someoneTimeP.style.fontSize = "0.8em";

  if (user === logUser) {
    const logText = document.createTextNode(message);
    const timeText = document.createTextNode(time);
    clientLogP.appendChild(logText);
    clientTimeP.appendChild(timeText);
    clientLog.appendChild(clientTimeP);
    clientLog.appendChild(clientLogP);
    dialogDiv.appendChild(clientLog);
  } else {
    const logText = document.createTextNode(message);
    const timeText = document.createTextNode(time);
    someoneLogP.appendChild(logText);
    someoneTimeP.appendChild(timeText);
    someoneLog.appendChild(someoneLogP);
    someoneLog.appendChild(someoneTimeP);
    dialogDiv.appendChild(someoneLog);
  }

  scrollBottom(dialogDiv);
};

const chatPreview = (username, date, content) => {
  const chatUser = document.getElementById(`chatUser:${username}`);
  const chatDate = document.getElementById(`chatDate:${username}`);
  const chatContent = document.getElementById(`chatContent:${username}`);

  if (chatUser !== null) {
    if (username === chatUser.innerHTML) {
      chatDate.innerHTML = date;
      chatContent.innerHTML = content;
    } else {
      createPreview(username, date, content);
    }
  } else {
    createPreview(username, date, content);
  }
};

const createPreview = (username, date, content) => {
  const listDiv = document.getElementById("listDiv");
  const list = document.createElement("div");
  list.id = `chatList:${username}`;
  listDiv.appendChild(list);
  list.style.width = "80%";
  list.style.backgroundColor = "#fff";
  list.style.height = "70px";
  list.style.lineHeight = "70px";
  list.style.margin = "20px auto 0 auto";
  list.style.borderRadius = "5px";
  list.style.cursor = "pointer";
  list.style.position = "relative";

  const listUserName = document.createElement("h3");
  const listUserNameText = document.createTextNode(username);
  listUserName.appendChild(listUserNameText);
  list.appendChild(listUserName);
  listUserName.id = `chatUser:${username}`;
  listUserName.className = "no-drag";
  listUserName.style.width = "50%";
  listUserName.style.height = "20px";
  listUserName.style.lineHeight = "20px";
  listUserName.style.position = "absolute";
  listUserName.style.top = "5%";
  listUserName.style.left = "5%";
  listUserName.style.margin = "0";
  listUserName.style.fontSize = "1.4em";
  listUserName.style.fontFamily = "Maven Pro, sans-serif";
  listUserName.style.color = "#696969";

  const listDate = document.createElement("p");
  const listDateText = document.createTextNode(date);
  listDate.appendChild(listDateText);
  list.appendChild(listDate);
  listDate.id = `chatDate:${username}`;
  listDate.className = "no-drag";
  listDate.style.width = "40%";
  listDate.style.position = "absolute";
  listDate.style.right = "5%";
  listDate.style.top = "5%";
  listDate.style.paddingRight = "1%";
  listDate.style.textAlign = "right";
  listDate.style.margin = "0";
  listDate.style.height = "20px";
  listDate.style.lineHeight = "20px";
  listDate.style.fontSize = "0.9em";
  listDate.style.fontFamily = "Maven Pro, sans-serif";
  listDate.style.color = "#696969";

  const listContent = document.createElement("p");
  const listContentText = document.createTextNode(content);
  listContent.appendChild(listContentText);
  list.appendChild(listContent);
  listContent.id = `chatContent:${username}`;
  listContent.className = "no-drag";
  listContent.style.width = "90%";
  listContent.style.height = "70px";
  listContent.style.lineHeight = "20px";
  listContent.style.margin = "0 5% 0 5%";
  listContent.style.verticalAlign = "bottom";
  listContent.style.fontSize = "0.9em";
  listContent.style.fontFamily = "sans-serif";
  listContent.style.color = "#999";
  listContent.style.wordBreak = "break-all";
  listContent.style.overflow = "hidden";
  listContent.style.textOverflow = "ellipsis";
  listContent.style.display = "-webkit-box";
  listContent.style.display = "-ms-flexbox";
  listContent.style.display = "box";
  listContent.style.webkitBoxOrient = "vertical";
  listContent.style.webkitLineClamp = "2";
  listContent.style.paddingTop = "30px";
};

// client용
const clientDiv2 = document.createElement("div");
clientDiv2.id = "clientDiv2";

clientDiv2.style.width = "57.5%";
clientDiv2.style.marginRight = "2.5%";
clientDiv2.style.backgroundColor = "#fff";
clientDiv2.style.height = "500px";
clientDiv2.style.lineHeight = "20px";
clientDiv2.style.display = "inline-block";
clientDiv2.style.verticalAlign = "middle";

// 제목 div
const titleDiv2 = document.createElement("div");
titleDiv2.className = "titleDiv2";
clientDiv2.appendChild(titleDiv2);

titleDiv2.style.width = "80%";
titleDiv2.style.height = "50px";
titleDiv2.style.lineHeight = "50px";
titleDiv2.style.margin = "0 auto";
titleDiv2.style.borderBottom = "1px solid #ddd";

// 제목 text
const title2H3 = document.createElement("h3");
title2H3.className = "title2H3";
title2H3.className = "no-drag";
titleDiv2.appendChild(title2H3);
const title2Text = document.createTextNode("online_");
const title2Span = document.createElement("span");
const title2SpanText = document.createTextNode(" Client");
title2H3.appendChild(title2Text);
title2Span.appendChild(title2SpanText);
title2H3.appendChild(title2Span);

title2H3.style.display = "inline";
title2H3.style.verticalAlign = "middle";
title2H3.style.fontFamily = "Maven Pro, sans-serif";
title2H3.style.fontSize = "1.2em";
title2H3.style.color = "#999";
title2Span.style.color = "#1E90FF";
title2Span.style.fontFamily = "Maven Pro, sans-serif";
title2Span.style.fontWeight = "600";
title2Span.style.fontSize = "1.5em";

// Close text
const titleP2 = document.createElement("p");
titleP2.className = "titleP2";
titleDiv.appendChild(titleP2);
// const closeX = document.createTextNode("x");
// titleP2.appendChild(closeX);

titleP2.style.display = "inline";
titleP2.style.margin = "0";

// 내용 div
const contentDiv2 = document.createElement("div");
contentDiv2.className = "contentDiv2";
clientDiv2.appendChild(contentDiv2);

const dialogDiv2 = document.createElement("div");
dialogDiv2.id = "dialogDiv2";
dialogDiv2.className = "chatScrollbar";
contentDiv2.appendChild(dialogDiv2);

dialogDiv2.style.width = "100%";
dialogDiv2.style.height = "390px";
dialogDiv2.style.margin = "0 auto";
dialogDiv2.style.padding = "15px 10% 0 10%";
dialogDiv2.style.overflowY = "auto";

// 보내기 div
const footerDiv2 = document.createElement("div");
footerDiv2.id = "footerDiv2";
contentDiv2.appendChild(footerDiv2);

footerDiv2.style.width = "80%";
footerDiv2.style.margin = "0 auto";
footerDiv2.style.height = "60px";
footerDiv2.style.lineHeight = "60px";
footerDiv2.style.textAlign = "center";
footerDiv2.style.borderTop = "1px solid #ccc";

// 채팅 입력창
const messageInput2 = document.createElement("TEXTAREA");
messageInput2.id = "messageInput2";
messageInput2.className = "chatScrollbar";
messageInput2.cols = "40";
messageInput2.rows = "1";

footerDiv2.appendChild(messageInput2);

messageInput2.style.width = "75%";
messageInput2.style.margin = "0 2.5% 0 0";
messageInput2.style.padding = "0 0 0 3%";
messageInput2.style.maxHeight = "210px";
messageInput2.style.minHeight = "30px";
messageInput2.style.lineHeight = "30px";
messageInput2.style.verticalAlign = "middle";
messageInput2.style.border = "1px solid #ddd";
messageInput2.style.borderRadius = "15px";
messageInput2.style.overflowY = "hidden";
messageInput2.style.fontFamily = "TmoneyRoundWindRegular, sans-serif";
messageInput2.style.resize = "none";
messageInput2.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
messageInput2.addEventListener("focus", function () {
  this.style.outline = "#ccc";
});

// 채팅 보내기 버튼
const messageButton2 = document.createElement("BUTTON");
messageButton2.id = "messageButton2";
messageButton2.className = "no-drag";
const sendButton2 = document.createTextNode("전송");
messageButton2.appendChild(sendButton2);
footerDiv2.appendChild(messageButton2);

messageButton2.style.width = "75px";
messageButton2.style.margin = "0 0 0 2.5%";
messageButton2.style.height = "30px";
messageButton2.style.lineHeight = "30px";
messageButton2.style.verticalAlign = "middle";
messageButton2.style.backgroundColor = "#1E90FF";
messageButton2.style.color = "#fff";
messageButton2.style.border = "1px solid #ccc";
messageButton2.style.opacity = "0.7";
messageButton2.addEventListener("focus", function () {
  this.style.border = "1px solid #888";
  this.style.outline = "#888";
});

// clientChatBox 적용
const clientChatBoxDiv = document.getElementById("clientChatBox");
if (clientChatBoxDiv) {
  clientChatBoxDiv.appendChild(clientDiv2);
}

clientDiv.onclick = () => {
  const messageInput = document.getElementById("messageInput");
  const dialogDiv = document.getElementById("dialogDiv");
  const footerDiv = document.getElementById("footerDiv");
  const empty = isEmpty(messageInput.value);
  const messageButton = document.getElementById("messageButton");
  fucusProcess(dialogDiv, messageInput, footerDiv, messageButton);
  sendCheck(empty, messageButton);
};
clientDiv2.onclick = () => {
  const messageInput = document.getElementById("messageInput2");
  const dialogDiv = document.getElementById("dialogDiv2");
  const footerDiv = document.getElementById("footerDiv2");
  const empty = isEmpty(messageInput.value);
  const messageButton = document.getElementById("messageButton2");
  fucusProcess(dialogDiv, messageInput, footerDiv, messageButton);
  sendCheck(empty, messageButton);
};
const sendCheck = (empty, messageButton) => {
  if (empty) {
    messageButton.disabled = true;
    messageButton.style.opacity = "0.7";
  } else {
    messageButton.disabled = false;
    messageButton.style.opacity = "1";
    messageButton.style.cursor = "pointer";
  }
};
const fucusProcess = (dialogDiv, messageInput, footerDiv, messageButton) => {
  const focusDom = document.activeElement;
  let preHeight = messageInput.offsetHeight;
  // 높이에 따라 다른 div 높이도 달라져야함 키 누르는거와 상관없이.
  if (focusDom === messageInput) {
    document.onkeyup = (e) => {
      messageInput.style.height = "1px";
      messageInput.style.height = 1 + messageInput.scrollHeight + "px";
      chatHeightCtrl();
      const empty = isEmpty(messageInput.value);
      sendCheck(empty, messageButton);
      if (e.which === 13 && !e.ctrlKey) {
        e.preventDefault();
        return false;
      }
    };

    document.onkeydown = (e) => {
      // ctrl + enter
      if (e.which === 13 && e.ctrlKey) {
        // 줄 바꿈
        messageInput.value = `${messageInput.value}\n`;
        scrollBottom(messageInput);
        return;
      }
      messageInput.style.height = "1px";
      messageInput.style.height = 1 + messageInput.scrollHeight + "px";
      chatHeightCtrl();
      const empty = isEmpty(messageInput.value);
      sendCheck(empty, messageButton);
      if (e.which === 13 && !e.ctrlKey) {
        e.preventDefault();
        return false;
      }
    };
  }

  const chatHeightCtrl = () => {
    //키를 누를 때마다 높이 변화 확인
    //textarea height 상승
    if (preHeight < messageInput.offsetHeight) {
      const ratio = Math.round((messageInput.offsetHeight - preHeight) / 30);
      preHeight = messageInput.offsetHeight;
      footerDiv.style.height = footerDiv.offsetHeight + 30 * ratio + "px";
      footerDiv.style.lineHeight = footerDiv.offsetHeight + "px";
      dialogDiv.style.height = dialogDiv.offsetHeight - 30 * ratio + "px";
      scrollBottom(messageInput);
      scrollBottom(dialogDiv);
      return;
    }
    // textarea height 감소
    if (preHeight > messageInput.offsetHeight) {
      const ratio = Math.round((preHeight - messageInput.offsetHeight) / 30);
      preHeight = messageInput.offsetHeight;
      footerDiv.style.height = footerDiv.offsetHeight - 30 * ratio + "px";
      footerDiv.style.lineHeight = footerDiv.style.height;
      dialogDiv.style.height = dialogDiv.offsetHeight + 30 * ratio + "px";
      scrollBottom(messageInput);
      scrollBottom(dialogDiv);
      return;
    }
    if (messageInput.offsetHeight > 200) {
      messageInput.style.overflowY = "auto";
    } else {
      messageInput.style.overflowY = "hidden";
    }
  };
};
