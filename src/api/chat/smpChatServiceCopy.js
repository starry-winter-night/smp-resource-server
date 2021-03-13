(function (w) {
  // craete namespace
  const smpChat = {
    setting: {
      chatService: class ChatService {
        constructor(domId, clientId, api, option) {
          this.domId = domId;
          this.clientId = clientId;
          this.api = api;
          this.option = option;
        }
        async init(id, nickName) {
          if (!nickName) nickName = "관리자";
          this.id = id;
          this.nickName = nickName;
          try {
            const socket = connectManagerURL(
              this.clientId,
              this.api,
              this.id,
              this.nickName
            );

            // 소켓 사용
            useSocketArea(socket, this.domId);

            // 에러처리
            errSocketArea(socket);

            function drawManagerChat(state) {
              managerHTML();
              ctrlButtonSwitch(state);
              powerSwitchClick(state);
            }
            function drawClientChat() {
              clientHTML();
            }
            function useSocketArea(socket, domId) {
              socket.on("connect", () => {
                console.log("server connect!!");
              });
              socket.on("initChat", (data) => {
                drawChat(data, domId);
                processMessageSend(socket);
              });
              socket.on("preview", (previewData) => {
                // 프리뷰 그리기
                drawPreview(previewData);
              });

              function drawPreview(data) {
                const listDiv = document.getElementById("smp_listDiv");
                const list = document.createElement("div");
                list.id = `smp_chatList`;
                listDiv.appendChild(list);
                list.style.width = "80%";
                list.style.backgroundColor = "#fff";
                list.style.height = "70px";
                list.style.lineHeight = "70px";
                list.style.margin = "15px auto 15px auto";
                list.style.borderRadius = "5px";
                list.style.cursor = "pointer";
                list.style.position = "relative";

                const listUserName = document.createElement("h3");
                const listUserNameText = document.createTextNode(data.nickName);
                listUserName.appendChild(listUserNameText);
                list.appendChild(listUserName);
                listUserName.id = `smp_chatUser`;
                listUserName.className = "smp_no-drag";
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
                const listDateText = document.createTextNode(
                  data.msgTime.messageViewTime
                );
                listDate.appendChild(listDateText);
                list.appendChild(listDate);
                listDate.id = `smp_chatDate`;
                listDate.className = "smp_no-drag";
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
                const listContentText = document.createTextNode(data.message);
                listContent.appendChild(listContentText);
                list.appendChild(listContent);
                listContent.id = `smp_chatContent`;
                listContent.className = "smp_no-drag";
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
                listContent.style.paddingTop = "25px";
              }
              function sendMessageSocket(socket, message) {
                socket.emit("message", { message });
              }
              function drawChat(data, domId) {
                if (!domId)
                  throw new SmpChatError("채팅이 그려질 domId를 설정해주세요.");
                initRemainHTML(domId);
                commonHTML(domId);
                const state = false;
                data.userType === "manager"
                  ? drawManagerChat(state)
                  : drawClientChat();
              }
              function processMessageSend(socket) {
                const sendButton = document.getElementById("smp_messageButton");
                const message = document.getElementById("smp_messageInput");

                if (sendButton && message) {
                  message.addEventListener("keydown", (evt) => {
                    evt.key === "Enter" && !evt.ctrlKey
                      ? checkEmptyString(message.value)
                        ? (sendMessageSocket(socket, message.value),
                          (message.value = ""),
                          evt.preventDefault())
                        : (message.value = "")
                      : false;
                  });
                  sendButton.addEventListener("click", (evt) => {
                    evt.preventDefault();
                    checkEmptyString(message.value)
                      ? (sendMessageSocket(socket, message.value),
                        (message.value = ""),
                        message.focus())
                      : (message.value = "");
                  });
                } else {
                  alert("새로고침이 필요합니다.");
                }
              }
            }

            function checkEmptyString(data) {
              return typeof data.trim() === "string" && data.trim() !== ""
                ? true
                : false;
            }
            function errSocketArea(socket) {
              socket.on("connect_error", (err) => console.log(err));
              socket.on("connect_failed", (err) => console.log(err));
              socket.on("disconnect", (err) => console.log(err));
              socket.on("error", (err) => console.log(err.content));
            }

            function connectManagerURL(clientId, apiKey, managerId, nickName) {
              return io(
                `ws://localhost:7000/${apiKey}?CLIENTID=${clientId}&USERID=${managerId}&NICKNAME=${nickName}`
              );
            }
            function powerSwitchClick(state) {
              const powerSwitch = document.getElementById("smp_chatSwitch");
              powerSwitch.addEventListener("click", (evt) => {
                evt.preventDefault();
                state = state ? (state = false) : (state = true);
                ctrlButtonSwitch(state);
              });
              return state;
            }

            function ctrlButtonSwitch(state) {
              state ? turnOnButton() : turnOffButton();
              function turnOffButton() {
                document.getElementById(
                  "smp_switchSpan"
                ).style.backgroundColor = "#ccc";
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "position:absolute;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  'content:"";'
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "height:22px;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "width:22px;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "left:4px;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "bottom:4px;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "background-color:#fff;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "-webkit-transition: .4s;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "transition: .4s;"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "-webkit-transform: translateX(0);"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "-ms-transform: translateX(0);"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "transform: translateX(0);"
                );
                document.getElementById("smp_switchOffP").style.display =
                  "inline";
                document.getElementById("smp_switchOnP").style.display = "none";
              }
              function turnOnButton() {
                document.getElementById(
                  "smp_switchSpan"
                ).style.backgroundColor = "#2196F3";

                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "-webkit-transform: translateX(30px);"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "-ms-transform: translateX(30px);"
                );
                document.styleSheets[0].addRule(
                  ".smp_switchSpan:before",
                  "transform: translateX(30px);"
                );
                document.getElementById("smp_switchOffP").style.display =
                  "none";
                document.getElementById("smp_switchOnP").style.display =
                  "inline";
              }
            }
            function stringifyOption(option) {
              return !option ? (option = false) : JSON.stringify(option);
            }
            function initRemainHTML(domId) {
              const chatBox = document.getElementById(`${domId}`);
              const SMP_CHAT_DIV = document.getElementById("smp_chatDiv");
              const SMP_CHAT_IMG = document.getElementById("chatBoxImg");
              if (chatBox && SMP_CHAT_DIV && SMP_CHAT_IMG) {
                chatBox.removeChild(SMP_CHAT_DIV);
                chatBox.removeChild(SMP_CHAT_IMG);
              }
            }
            function commonHTML(domId) {
              const newFontMavenPro = document.createElement("style");
              newFontMavenPro.textContent = `@font-face { font-family: 'Maven Pro', src: url(https://fonts.gstatic.com/s/mavenpro/v21/7Auup_AqnyWWAxW2Wk3swUz56MS91Eww8SX21nijogp5.woff2) format('woff2');  font-weight: 400; font-style: normal; }`;
              document.head.appendChild(newFontMavenPro);

              const newFontTmoneyRoundWind2 = document.createElement("style");
              newFontTmoneyRoundWind2.textContent = `@font-face { font-family: 'TmoneyRoundWindRegular'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindRegular.woff') format('woff'); font-weight: normal; font-style: normal; }`;
              document.head.appendChild(newFontTmoneyRoundWind2);

              //scroll bar
              const styleDom = document.createElement("style");
              styleDom.textContent = `
            .smp_chatScrollbar::-webkit-scrollbar{
              width:6px;
            }
            .smp_chatScrollbar::-webkit-scrollbar-track {
              background-color: transparent;
            }
            .smp_chatScrollbar::-webkit-scrollbar-thumb {
              border-radius: 3px;
              background-color: #ccc;
            }
            .smp_chatScrollbar::-webkit-scrollbar-button {
              width: 0;
              height: 0;
            }
            .smp_chatScrollbar{scrollbar-width: thin;}`; // firefox 스크롤바 css
              document.head.appendChild(styleDom);

              //text drag do not
              const drag = document.createElement("style");
              drag.textContent = `
            .smp_no-drag {-ms-user-select: none; 
            -moz-user-select: -moz-none; 
            -webkit-user-select: none; 
            -khtml-user-select: none; 
            user-select:none;}`;
              document.head.appendChild(drag);

              const smp_chatDiv = document.createElement("div");
              smp_chatDiv.id = "smp_chatDiv";

              smp_chatDiv.style.display = "none";
              smp_chatDiv.style.width = "100%";
              smp_chatDiv.style.margin = "0 auto";
              smp_chatDiv.style.height = "530px";
              smp_chatDiv.style.lineHeight = "530px";
              smp_chatDiv.style.backgroundColor = "#6495ed";
              smp_chatDiv.style.borderRadius = "15px";
              // 공통 채팅창
              const clientDiv = document.createElement("div");
              clientDiv.id = "smp_clientDiv";
              smp_chatDiv.appendChild(clientDiv);

              clientDiv.style.width = "57.5%";
              clientDiv.style.margin = "15px 1.5% 0 0";
              clientDiv.style.backgroundColor = "#fff";
              clientDiv.style.height = "500px";
              clientDiv.style.lineHeight = "20px";
              clientDiv.style.display = "inline-block";
              clientDiv.style.float = "right";
              clientDiv.style.borderTopRightRadius = "10px";
              clientDiv.style.borderBottomRightRadius = "10px";

              // 제목 div
              const titleDiv = document.createElement("div");
              titleDiv.id = "smp_titleDiv";
              clientDiv.appendChild(titleDiv);

              titleDiv.style.width = "80%";
              titleDiv.style.height = "50px";
              titleDiv.style.lineHeight = "50px";
              titleDiv.style.margin = "0 auto";
              titleDiv.style.borderBottom = "1px solid #ddd";

              // 제목 text
              const chatUserName = document.createElement("div");
              chatUserName.id = "smp_chatUserName";
              const titleH3 = document.createElement("h3");
              titleH3.id = "smp_titleH3";
              titleH3.className = "smp_no-drag";
              chatUserName.appendChild(titleH3);
              titleDiv.appendChild(chatUserName);
              const titleSpan = document.createElement("span");
              titleSpan.id = "smp_titleSpan";
              titleH3.appendChild(titleSpan);

              chatUserName.style.display = "inline-block";
              chatUserName.style.width = "75%";
              chatUserName.style.verticalAlign = "-webkit-baseline-middle";
              chatUserName.style.textOverflow = "ellipsis";
              chatUserName.style.overflow = "hidden";
              chatUserName.style.whiteSpace = "nowrap";
              chatUserName.style.color = "#1E90FF";

              titleH3.style.display = "inline";
              // titleH3.style.verticalAlign = "middle";
              titleH3.style.fontFamily = "Maven Pro, sans-serif";
              titleH3.style.fontSize = "1.2em";
              titleH3.style.color = "#999";
              titleSpan.style.color = "#1E90FF";
              titleSpan.style.fontFamily = "Maven Pro, sans-serif";
              titleSpan.style.fontWeight = "600";
              titleSpan.style.fontSize = "1.5em";

              // Close
              const chatCloseImg = document.createElement("IMG");
              chatCloseImg.setAttribute(
                "src",
                `http://localhost:5000/chat/image?name=Xicon.png`
              );
              chatCloseImg.setAttribute("alt", "chatCloseButtonImage");
              chatCloseImg.id = "smp_chatCloseImg";
              chatCloseImg.className = "smp_no-drag";
              chatCloseImg.style.width = "13px";
              chatCloseImg.style.height = "13px";
              chatCloseImg.style.margin = "0";
              chatCloseImg.style.position = "absolute";
              chatCloseImg.style.top = "6%";
              chatCloseImg.style.right = "4%";
              chatCloseImg.style.cursor = "pointer";

              const chatComplete = document.createElement("div");
              chatComplete.id = `smp_chatComplete`;

              const chatCompleteP = document.createElement("p");
              chatCompleteP.id = `smp_chatCompleteP`;
              chatCompleteP.className = "smp_no-drag";
              chatComplete.appendChild(chatCompleteP);

              const chatCompleteText = document.createTextNode("상담완료");
              chatCompleteP.appendChild(chatCompleteText);

              chatComplete.style.display = "inline-block";
              chatComplete.style.width = "20%";
              chatComplete.style.verticalAlign = "middle";
              chatComplete.style.display = "none";
              chatCompleteP.style.height = "35px";
              chatCompleteP.style.lineHeight = "35px";
              chatCompleteP.style.margin = "0 auto";
              chatCompleteP.style.backgroundColor = "#1E90FF";
              chatCompleteP.style.color = "#FFF";
              chatCompleteP.style.fontSize = "1.1em";
              chatCompleteP.style.fontWeight = "700";
              chatCompleteP.style.fontFamily = "Maven Pro, sans-serif";
              chatCompleteP.style.width = "75px";
              chatCompleteP.style.borderRadius = "10px";
              chatCompleteP.style.cursor = "pointer";
              chatCompleteP.style.textAlign = "center";

              titleDiv.appendChild(chatCloseImg);
              titleDiv.appendChild(chatComplete);

              // 내용 div
              const contentDiv = document.createElement("div");
              clientDiv.appendChild(contentDiv);

              const dialogDiv = document.createElement("div");
              dialogDiv.id = "smp_dialogDiv";
              dialogDiv.className = "smp_chatScrollbar";
              contentDiv.appendChild(dialogDiv);

              dialogDiv.style.width = "100%";
              dialogDiv.style.height = "390px";
              dialogDiv.style.margin = "0 auto";
              dialogDiv.style.padding = "15px 10% 0 10%";
              dialogDiv.style.overflowY = "auto";

              dialogDiv.scrollTop = dialogDiv.scrollHeight;

              // 보내기 div
              const footerDiv = document.createElement("div");
              footerDiv.id = "smp_footerDiv";
              contentDiv.appendChild(footerDiv);

              footerDiv.style.width = "80%";
              footerDiv.style.margin = "0 auto";
              footerDiv.style.height = "60px";
              footerDiv.style.lineHeight = "60px";
              footerDiv.style.textAlign = "center";
              footerDiv.style.borderTop = "1px solid #ccc";

              // 채팅 입력창
              const messageInput = document.createElement("TEXTAREA");
              messageInput.id = "smp_messageInput";
              messageInput.className = "smp_chatScrollbar";
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
              messageInput.style.fontFamily =
                "TmoneyRoundWindRegular, sans-serif";
              messageInput.style.resize = "none";
              messageInput.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
              messageInput.addEventListener("focus", function () {
                this.style.outline = "#ccc";
              });

              // 채팅 보내기 버튼
              const messageButton = document.createElement("BUTTON");
              messageButton.id = "smp_messageButton";
              messageButton.className = "smp_no-drag";
              const sendButton = document.createTextNode("전송");
              messageButton.appendChild(sendButton);
              footerDiv.appendChild(messageButton);

              messageButton.style.width = "75px";
              messageButton.style.margin = "0 0 0 2.5%";
              messageButton.style.height = "30px";
              messageButton.style.lineHeight = "27px";
              messageButton.style.verticalAlign = "middle";
              messageButton.style.backgroundColor = "#1E90FF";
              messageButton.style.color = "#fff";
              messageButton.style.border = "1px solid #ccc";
              messageButton.style.opacity = "0.7";
              messageButton.addEventListener("focus", function () {
                this.style.border = "1px solid #888";
                this.style.outline = "#888";
              });

              const chatBox = document.getElementById(`${domId}`);
              if (chatBox) {
                const chatBoxImg = document.createElement("IMG");
                chatBoxImg.id = "chatBoxImg";
                chatBoxImg.setAttribute(
                  "src",
                  `http://localhost:5000/chat/image?name=chat.png`
                );
                chatBoxImg.setAttribute("alt", "chatBoxImage");
                chatBoxImg.style.setProperty("width", "65px", "important");
                chatBoxImg.style.setProperty("height", "70px", "important");
                chatBoxImg.style.setProperty(
                  "position",
                  "absolute",
                  "important"
                );
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
                  const chatDiv = document.getElementById("smp_chatDiv");

                  chatBoxImg.classList.toggle("chatBoxActive");
                  chatCloseImg.onclick = () => {
                    chatBoxImg.classList.toggle("chatBoxActive");
                    chatBoxImg.style.setProperty(
                      "display",
                      "block",
                      "important"
                    );
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
              // chatBox에 적용
              // 공통 채팅창 적용
              const chatBoxDiv = document.getElementById(`${domId}`);
              if (chatBoxDiv !== null) {
                chatBoxDiv.appendChild(smp_chatDiv);
              }
            }
            function managerHTML() {
              const managerDiv = document.createElement("div");
              document.getElementById("smp_chatDiv").appendChild(managerDiv);

              managerDiv.style.width = "37.5%";
              managerDiv.style.margin = "15px 0 0 1.5%";
              managerDiv.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
              managerDiv.style.height = "500px";
              managerDiv.style.display = "inline-block";
              managerDiv.style.position = "relative";
              managerDiv.style.float = "left";
              managerDiv.style.borderTopLeftRadius = "10px";
              managerDiv.style.borderBottomLeftRadius = "10px";

              const connectDiv = document.createElement("div");
              managerDiv.appendChild(connectDiv);
              const connectH3 = document.createElement("h3");
              connectH3.className = "smp_no-drag";
              const connectText = document.createTextNode(
                "Connect to Chat Server : "
              );
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
              radioDiv.className = "smp_radioDiv";
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
              startInput.id = "smp_chatSwitch";

              switchLabel.appendChild(startInput);
              switchLabel.appendChild(switchSpan);
              switchSpan.className = "smp_switchSpan smp_round";
              switchSpan.id = "smp_switchSpan";

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
              switchOffP.id = "smp_switchOffP";
              switchOffP.appendChild(switchOff);
              const switchOnP = document.createElement("p");
              const switchOn = document.createTextNode("ON");
              switchOnP.id = "smp_switchOnP";
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
              document.styleSheets[0].addRule(".smp_radioDiv p", "margin:0px;");
              document.styleSheets[0].addRule(
                ".smp_radioDiv p",
                "display:inline-block;"
              );
              document.styleSheets[0].addRule(
                ".smp_radioDiv p",
                "font-size:15px;"
              );
              document.styleSheets[0].addRule(
                ".smp_radioDiv p",
                "font-weight:bold;"
              );

              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "position:absolute;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                'content:"";'
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "height:22px;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "width:22px;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "left:4px;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "bottom:4px;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "background-color:#fff;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "-webkit-transition: .4s;"
              );
              document.styleSheets[0].addRule(
                ".smp_switchSpan:before",
                "transition: .4s;"
              );

              document.styleSheets[0].addRule(
                ".smp_round",
                "border-radius: 30px;"
              );
              document.styleSheets[0].addRule(
                ".smp_round:before",
                "border-radius: 50%;"
              );

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
                    ".smp_switchSpan:before",
                    "-webkit-transform: translateX(30px);"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "-ms-transform: translateX(30px);"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "transform: translateX(30px);"
                  );
                  switchOffP.style.display = "none";
                  switchOnP.style.display = "inline";
                  //서버 연결
                  //managerConnect(check);
                } else {
                  switchSpan.style.backgroundColor = "#ccc";
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "position:absolute;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    'content:"";'
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "height:22px;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "width:22px;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "left:4px;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "bottom:4px;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "background-color:#fff;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "-webkit-transition: .4s;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "transition: .4s;"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "-webkit-transform: translateX(0);"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "-ms-transform: translateX(0);"
                  );
                  document.styleSheets[0].addRule(
                    ".smp_switchSpan:before",
                    "transform: translateX(0);"
                  );
                  switchOffP.style.display = "inline";
                  switchOnP.style.display = "none";
                  managerConnect(check);
                }
              };
              // 채팅 요구 리스트
              const listDiv = document.createElement("div");
              listDiv.id = "smp_listDiv";
              listDiv.className = "smp_chatScrollbar";
              managerDiv.appendChild(listDiv);
              listDiv.style.overflowY = "auto";
              listDiv.style.width = "100%";
              listDiv.style.height = "450px";
              listDiv.style.position = "absolute";
              listDiv.style.top = "50px";
            }
            function clientHTML() {
              // 바탕 div
              const smp_chatDiv = document.getElementById("smp_chatDiv");
              smp_chatDiv.style.width = "50%";
              smp_chatDiv.style.textAlign = "center";
              smp_chatDiv.style.float = "right";
              const clientDiv = document.getElementById("smp_clientDiv");
              clientDiv.style.width = "95%";
              clientDiv.style.margin = "0 auto";
              clientDiv.style.verticalAlign = "middle";
              clientDiv.style.borderRadius = "10px";
              clientDiv.style.float = "none";
              clientDiv.style.clear = "both";
              // 제목 div
              const titleDiv = document.getElementById("smp_titleDiv");
              titleDiv.style.textAlign = "left";
              // 제목 text
              const titleH3 = document.getElementById("smp_titleH3");
              const titleText = document.createTextNode("Server_");
              const titleSpan = document.getElementById("smp_titleSpan");
              const titleSpanText = document.createTextNode("on!");
              titleSpan.appendChild(titleSpanText);
              titleH3.appendChild(titleText);
              titleH3.appendChild(titleSpan);
              // 보내기 div
              const messageInput = document.getElementById("smp_messageInput");
              messageInput.style.width = "70%";
              // Close
              const chatCloseImg = document.getElementById("smp_chatCloseImg");
              chatCloseImg.style.right = "3%";

              function processThrowServerError(response) {
                throw new SmpChatError(
                  `${response.statusText}(${response.status})`
                );
              }
              function processThrowError(data) {
                throw new SmpChatError(data.message);
              }
            }
          } catch (e) {
            SmpChatError.errHandle(e);
          }
        }
      },
      client: class Client {
        constructor(domId, clientId, api) {
          this.domId = domId;
          this.clientId = clientId;
          this.api = api;
          // smpChat.setChat.manager.commonHTML();
          // Client.clientHTML();
        }
        async init(userId) {
          try {
            userId
              ? (this.userId = userId)
              : (this.userId = processNonLoginUser());

            const socket = connectClientURL(
              this.clientId,
              this.api,
              this.userId
            );

            errSocketArea(socket);
            useSocketArea(socket);

            function useSocketArea(socket) {
              socket.on("connect", () => {
                messageSocket();
              });
              function messageSocket() {
                socket.on("message", (data) => {
                  console.log(data.message);
                });
              }
            }
            function processNonLoginUser() {
              let uid = null;
              const getUid = localStorage.getItem("nonUserId");
              if (getUid === null) {
                uid = createUID();
                localStorage.setItem("nonUserId", uid);
              } else {
                uid = getUid;
              }
              return uid;
            }
            function errSocketArea(socket) {
              socket.on("connect_error", (err) => console.log(err));
              socket.on("connect_failed", (err) => console.log(err));
              socket.on("disconnect", (err) => console.log(err));
              socket.on("error", (err) => console.log(err.content));
            }

            function createUID() {
              return Math.random().toString(36).substring(2, 8) + +new Date();
            }

            function connectClientURL(clientId, apiKey, userId) {
              return io(
                `ws://localhost:7000/${apiKey}?CLIENTID=${clientId}&USERID=${userId}`
              );
            }

            function drawingManagerChat(domId, data) {
              if (!domId)
                throw new SmpChatError("관리자 채팅 domId를 설정해주세요.");
              Manager.commonHTML(domId);
              managerHTML(domId);
              ctrlButtonSwitch(data.state);
            }
          } catch (e) {
            SmpChatError.errHandle(e);
          }
        }
      },
    },
  };

  class SmpChatError extends Error {
    constructor(message) {
      super(message);
      this.message = message;
      this.name = "SmpChatError";
    }

    static errHandle(e) {
      return console.log(e);
      //return console.log(`${e.name} : ${e.message}`);
    }
  }
  w.smpChat = smpChat;
})(window);
