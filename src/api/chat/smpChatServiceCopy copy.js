(function (w) {
  // craete namespace
  const smpChat = {
    setChat: {
      manager: class Manager {
        constructor(domId, clientId, api, option) {
          this.domId = domId;
          this.clientId = clientId;
          this.api = api;
          this.option = option;
        }
        async init() {
          try {
            const res = await fetch(
              managerConnectURL(this.clientId, this.api, this.option)
            );
            const data = res.ok
              ? await responseData(res)
              : processThrowServerError(res);
            data.result
              ? drawingManagerChat(this.domId, data)
              : processThrowError(data);
            if (data.state === "on") managerConnect();

            if (data.state === "on") managerConnect(id, name, data.state);
            powerSwitchClick(data.state);

            // document.getElementById("smp_chatSwitch").onclick = function () {
            //   if (data.state === "off") data.state = "on";
            //   else data.state = "off";
            //   switchButtonCtrl(data.state);

            // };

            function powerSwitchClick(state) {
              const powerSwitch = document.getElementById("smp_chatSwitch");
              powerSwitch.addEventListener("click", (evt) => {
                evt.preventDefault();
                state = state === "off" ? (state = "on") : (state = "off");
                switchButtonCtrl(state);
                //managerConnect(id, name, data.state);
              });
            }
            function drawingManagerChat(domId, data) {
              if (!domId)
                throw new SmpChatError("관리자 채팅 domId를 설정해주세요.");
              Manager.commonHTML(domId);
              managerHTML(domId);
              //switchButtonCtrl(data.state);
            }

            function responseData(responseData) {
              return responseData.json();
            }
            function switchButtonCtrl(button) {
              button.state ? turnOnButton() : turnOffButton();
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
            function optionStringify(option) {
              return !option ? (option = false) : JSON.stringify(option);
            }
            function managerConnectURL(clientId, api, option) {
              return `http://localhost:5000/chat?CLIENTID=${clientId}&APIKEY=${api}&OPTION=${optionStringify(
                option
              )}`;
            }
            function managerHTML(domId) {
              // 관리자의 채팅창
              const chatBox = document.getElementById(`${domId}`);
              if (chatBox) {
                const chatBoxImg = document.createElement("IMG");
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
                  const chatCloseImg = document.getElementById(
                    "smp_chatCloseImg"
                  );
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
                  managerConnect(check);
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
            function processThrowServerError(response) {
              throw new SmpChatError(
                `${response.statusText}(${response.status})`
              );
            }
            function processThrowError(data) {
              throw new SmpChatError(data.message);
            }
          } catch (e) {
            SmpChatError.errHandle(e);
          }
        }

        smpChatDomId() {
          return this.domId;
        }
        smpChatDomId(managerDom) {
          if (managerDom.trim() === undefined || "" || false)
            throw new SmpChatError("올바른 dom id를 입력해주세요.");
          this.domId = managerDom.trim();
        }
        static async init(clientId, api) {}

        setManager(clientId) {
          this.clientId = clientId;

          const socket = io(`ws://localhost:7000/${this.clientId}`);
          const check = document.getElementById("smp_chatSwitch");
        }

        setClient(id, api, name) {
          this.id = id;
          this.api = api;
          this.name = name;
        }

        static commonHTML(domId) {
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
          chatCloseImg.style.width = "13px";
          chatCloseImg.style.height = "13px";
          chatCloseImg.style.margin = "0";
          chatCloseImg.style.position = "absolute";
          chatCloseImg.style.top = "7%";
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
          messageInput.style.fontFamily = "TmoneyRoundWindRegular, sans-serif";
          messageInput.style.resize = "none";
          messageInput.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
          messageInput.addEventListener("focus", function () {
            this.style.outline = "#ccc";
          });

          // 채팅 보내기 버튼
          const messageButton = document.createElement("BUTTON");
          messageButton.id = "smp_messageButton";
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
          // 공통 채팅창 적용
          const chatBoxDiv = document.getElementById(`${domId}`);
          if (chatBoxDiv !== null) {
            chatBoxDiv.appendChild(smp_chatDiv);
          }
        }
      },
      client: class Client {
        constructor() {
          smpChat.setChat.manager.commonHTML();
          Client.clientHTML();
        }
        // static commonHTML() {
        //   const newFontMavenPro = document.createElement("style");
        //   newFontMavenPro.textContent = `@font-face { font-family: 'Maven Pro', src: url(https://fonts.gstatic.com/s/mavenpro/v21/7Auup_AqnyWWAxW2Wk3swUz56MS91Eww8SX21nijogp5.woff2) format('woff2');  font-weight: 400; font-style: normal; }`;
        //   document.head.appendChild(newFontMavenPro);

        //   const newFontTmoneyRoundWind2 = document.createElement("style");
        //   newFontTmoneyRoundWind2.textContent = `@font-face { font-family: 'TmoneyRoundWindRegular'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindRegular.woff') format('woff'); font-weight: normal; font-style: normal; }`;
        //   document.head.appendChild(newFontTmoneyRoundWind2);

        //   //scroll bar
        //   const styleDom = document.createElement("style");
        //   styleDom.textContent = `
        // .smp_chatScrollbar::-webkit-scrollbar{
        //   width:6px;
        // }
        // .smp_chatScrollbar::-webkit-scrollbar-track {
        //   background-color: transparent;
        // }
        // .smp_chatScrollbar::-webkit-scrollbar-thumb {
        //   border-radius: 3px;
        //   background-color: #ccc;
        // }
        // .smp_chatScrollbar::-webkit-scrollbar-button {
        //   width: 0;
        //   height: 0;
        // }
        // .smp_chatScrollbar{scrollbar-width: thin;}`; // firefox 스크롤바 css
        //   document.head.appendChild(styleDom);

        //   //text drag do not
        //   const drag = document.createElement("style");
        //   drag.textContent = `
        // .smp_no-drag {-ms-user-select: none;
        // -moz-user-select: -moz-none;
        // -webkit-user-select: none;
        // -khtml-user-select: none;
        // user-select:none;}`;
        //   document.head.appendChild(drag);

        //   const smp_chatDiv = document.createElement("div");
        //   smp_chatDiv.id = "smp_chatDiv";

        //   smp_chatDiv.style.display = "none";
        //   smp_chatDiv.style.width = "100%";
        //   smp_chatDiv.style.margin = "0 auto";
        //   smp_chatDiv.style.height = "530px";
        //   smp_chatDiv.style.lineHeight = "530px";
        //   smp_chatDiv.style.backgroundColor = "#6495ed";
        //   smp_chatDiv.style.borderRadius = "15px";
        //   // 공통 채팅창
        //   const clientDiv = document.createElement("div");
        //   clientDiv.id = "smp_clientDiv";
        //   smp_chatDiv.appendChild(clientDiv);

        //   clientDiv.style.width = "57.5%";
        //   clientDiv.style.margin = "15px 1.5% 0 0";
        //   clientDiv.style.backgroundColor = "#fff";
        //   clientDiv.style.height = "500px";
        //   clientDiv.style.lineHeight = "20px";
        //   clientDiv.style.display = "inline-block";
        //   clientDiv.style.float = "right";
        //   clientDiv.style.borderTopRightRadius = "10px";
        //   clientDiv.style.borderBottomRightRadius = "10px";

        //   // 제목 div
        //   const titleDiv = document.createElement("div");
        //   titleDiv.id = "smp_titleDiv";
        //   clientDiv.appendChild(titleDiv);

        //   titleDiv.style.width = "80%";
        //   titleDiv.style.height = "50px";
        //   titleDiv.style.lineHeight = "50px";
        //   titleDiv.style.margin = "0 auto";
        //   titleDiv.style.borderBottom = "1px solid #ddd";

        //   // 제목 text
        //   const chatUserName = document.createElement("div");
        //   chatUserName.id = "smp_chatUserName";
        //   const titleH3 = document.createElement("h3");
        //   titleH3.id = "smp_titleH3";
        //   titleH3.className = "smp_no-drag";
        //   chatUserName.appendChild(titleH3);
        //   titleDiv.appendChild(chatUserName);
        //   const titleSpan = document.createElement("span");
        //   titleH3.appendChild(titleSpan);

        //   chatUserName.style.display = "inline-block";
        //   chatUserName.style.width = "75%";
        //   chatUserName.style.verticalAlign = "-webkit-baseline-middle";
        //   chatUserName.style.textOverflow = "ellipsis";
        //   chatUserName.style.overflow = "hidden";
        //   chatUserName.style.whiteSpace = "nowrap";
        //   chatUserName.style.color = "#1E90FF";

        //   titleH3.style.display = "inline";
        //   // titleH3.style.verticalAlign = "middle";
        //   titleH3.style.fontFamily = "Maven Pro, sans-serif";
        //   titleH3.style.fontSize = "1.2em";
        //   titleH3.style.color = "#999";
        //   titleSpan.style.color = "#1E90FF";
        //   titleSpan.style.fontFamily = "Maven Pro, sans-serif";
        //   titleSpan.style.fontWeight = "600";
        //   titleSpan.style.fontSize = "1.5em";

        //   // Close
        //   const chatCloseImg = document.createElement("IMG");
        //   chatCloseImg.setAttribute(
        //     "src",
        //     `http://localhost:5000/chat/image?name=Xicon.png`
        //   );
        //   chatCloseImg.setAttribute("alt", "chatCloseButtonImage");
        //   chatCloseImg.id = "smp_chatCloseImg";
        //   chatCloseImg.style.width = "13px";
        //   chatCloseImg.style.height = "13px";
        //   chatCloseImg.style.margin = "0";
        //   chatCloseImg.style.position = "absolute";
        //   chatCloseImg.style.top = "7%";
        //   chatCloseImg.style.right = "4%";
        //   chatCloseImg.style.cursor = "pointer";

        //   const chatComplete = document.createElement("div");
        //   chatComplete.id = `smp_chatComplete`;

        //   const chatCompleteP = document.createElement("p");
        //   chatCompleteP.id = `smp_chatCompleteP`;
        //   chatCompleteP.className = "smp_no-drag";
        //   chatComplete.appendChild(chatCompleteP);

        //   const chatCompleteText = document.createTextNode("상담완료");
        //   chatCompleteP.appendChild(chatCompleteText);

        //   chatComplete.style.display = "inline-block";
        //   chatComplete.style.width = "20%";
        //   chatComplete.style.verticalAlign = "middle";
        //   chatComplete.style.display = "none";
        //   chatCompleteP.style.height = "35px";
        //   chatCompleteP.style.lineHeight = "35px";
        //   chatCompleteP.style.margin = "0 auto";
        //   chatCompleteP.style.backgroundColor = "#1E90FF";
        //   chatCompleteP.style.color = "#FFF";
        //   chatCompleteP.style.fontSize = "1.1em";
        //   chatCompleteP.style.fontWeight = "700";
        //   chatCompleteP.style.fontFamily = "Maven Pro, sans-serif";
        //   chatCompleteP.style.width = "75px";
        //   chatCompleteP.style.borderRadius = "10px";
        //   chatCompleteP.style.cursor = "pointer";
        //   chatCompleteP.style.textAlign = "center";

        //   titleDiv.appendChild(chatCloseImg);
        //   titleDiv.appendChild(chatComplete);

        //   // 내용 div
        //   const contentDiv = document.createElement("div");
        //   clientDiv.appendChild(contentDiv);

        //   const dialogDiv = document.createElement("div");
        //   dialogDiv.id = "smp_dialogDiv";
        //   dialogDiv.className = "smp_chatScrollbar";
        //   contentDiv.appendChild(dialogDiv);

        //   dialogDiv.style.width = "100%";
        //   dialogDiv.style.height = "390px";
        //   dialogDiv.style.margin = "0 auto";
        //   dialogDiv.style.padding = "15px 10% 0 10%";
        //   dialogDiv.style.overflowY = "auto";

        //   dialogDiv.scrollTop = dialogDiv.scrollHeight;

        //   // 보내기 div
        //   const footerDiv = document.createElement("div");
        //   footerDiv.id = "smp_footerDiv";
        //   contentDiv.appendChild(footerDiv);

        //   footerDiv.style.width = "80%";
        //   footerDiv.style.margin = "0 auto";
        //   footerDiv.style.height = "60px";
        //   footerDiv.style.lineHeight = "60px";
        //   footerDiv.style.textAlign = "center";
        //   footerDiv.style.borderTop = "1px solid #ccc";

        //   // 채팅 입력창
        //   const messageInput = document.createElement("TEXTAREA");
        //   messageInput.id = "smp_messageInput";
        //   messageInput.className = "smp_chatScrollbar";
        //   messageInput.cols = "40";
        //   messageInput.rows = "1";

        //   footerDiv.appendChild(messageInput);

        //   messageInput.style.width = "75%";
        //   messageInput.style.margin = "0 2.5% 0 0";
        //   messageInput.style.padding = "0 0 0 3%";
        //   messageInput.style.maxHeight = "210px";
        //   messageInput.style.minHeight = "30px";
        //   messageInput.style.lineHeight = "30px";
        //   messageInput.style.verticalAlign = "middle";
        //   messageInput.style.border = "1px solid #ddd";
        //   messageInput.style.borderRadius = "15px";
        //   messageInput.style.overflowY = "hidden";
        //   messageInput.style.fontFamily = "TmoneyRoundWindRegular, sans-serif";
        //   messageInput.style.resize = "none";
        //   messageInput.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
        //   messageInput.addEventListener("focus", function () {
        //     this.style.outline = "#ccc";
        //   });

        //   // 채팅 보내기 버튼
        //   const messageButton = document.createElement("BUTTON");
        //   messageButton.id = "smp_messageButton";
        //   const sendButton = document.createTextNode("전송");
        //   messageButton.appendChild(sendButton);
        //   footerDiv.appendChild(messageButton);

        //   messageButton.style.width = "75px";
        //   messageButton.style.margin = "0 0 0 2.5%";
        //   messageButton.style.height = "30px";
        //   messageButton.style.lineHeight = "30px";
        //   messageButton.style.verticalAlign = "middle";
        //   messageButton.style.backgroundColor = "#1E90FF";
        //   messageButton.style.color = "#fff";
        //   messageButton.style.border = "1px solid #ccc";
        //   messageButton.style.opacity = "0.7";
        //   messageButton.addEventListener("focus", function () {
        //     this.style.border = "1px solid #888";
        //     this.style.outline = "#888";
        //   });

        //   // chatBox에 적용
        //   const chatBoxDiv = document.getElementById("smpManagerChat");
        //   if (chatBoxDiv !== null) {
        //     chatBoxDiv.appendChild(smp_chatDiv);
        //   }
        // }
        static clientHTML() {
          // 바탕 div
          const smp_chatDiv2 = document.createElement("div");
          smp_chatDiv2.id = "smp_chatDiv2";
          smp_chatDiv2.style.display = "none";
          smp_chatDiv2.style.width = "100%";
          smp_chatDiv2.style.backgroundColor = "#6495ED";
          smp_chatDiv2.style.margin = "0 auto";
          smp_chatDiv2.style.height = "530px";
          smp_chatDiv2.style.lineHeight = "530px";
          smp_chatDiv2.style.borderRadius = "15px";
          smp_chatDiv2.style.textAlign = "center";

          const clientDiv2 = document.createElement("div");
          clientDiv2.id = "smp_clientDiv2";
          clientDiv2.style.width = "95%";
          clientDiv2.style.display = "inline-block";
          clientDiv2.style.margin = "0 auto";
          clientDiv2.style.backgroundColor = "#fff";
          clientDiv2.style.height = "500px";
          clientDiv2.style.lineHeight = "20px";
          clientDiv2.style.verticalAlign = "middle";
          clientDiv2.style.borderRadius = "10px";
          smp_chatDiv2.appendChild(clientDiv2);

          // 제목 div
          const titleDiv2 = document.createElement("div");
          clientDiv2.appendChild(titleDiv2);
          titleDiv2.style.width = "90%";
          titleDiv2.style.height = "50px";
          titleDiv2.style.lineHeight = "50px";
          titleDiv2.style.margin = "0 auto";
          titleDiv2.style.borderBottom = "1px solid #ddd";
          titleDiv2.style.textAlign = "left";

          // 제목 text
          const title2H3 = document.createElement("h3");
          title2H3.className = "smp_no-drag";
          title2H3.id = "smp_title2H3";
          titleDiv2.appendChild(title2H3);
          const title2Text = document.createTextNode("Server_");
          const title2Span = document.createElement("span");
          const title2SpanText = document.createTextNode("on!");
          title2Span.id = "smp_title2Span";
          title2Span.appendChild(title2SpanText);
          title2H3.appendChild(title2Text);
          title2H3.appendChild(title2Span);

          title2H3.style.display = "inline";
          title2H3.style.verticalAlign = "middle";
          title2H3.style.fontFamily = "Maven Pro, sans-serif";
          title2H3.style.fontSize = "1.2em";
          title2H3.style.color = "#999999";
          title2H3.style.height = "50px";
          title2H3.style.lineHeight = "50px";
          title2Span.style.color = "#1E90FF";
          title2Span.style.paddingLeft = "2px";
          title2Span.style.fontFamily = "Maven Pro, sans-serif";
          title2Span.style.fontWeight = "600";
          title2Span.style.fontSize = "1.4em";

          // 내용 div
          const contentDiv2 = document.createElement("div");
          clientDiv2.appendChild(contentDiv2);

          const dialogDiv2 = document.createElement("div");
          dialogDiv2.id = "smp_dialogDiv2";
          dialogDiv2.className = "smp_chatScrollbar";
          contentDiv2.appendChild(dialogDiv2);

          dialogDiv2.style.width = "100%";
          dialogDiv2.style.height = "390px";
          dialogDiv2.style.margin = "0 auto";
          dialogDiv2.style.padding = "15px 5% 0 5%";
          dialogDiv2.style.overflowY = "auto";

          // 보내기 div
          const footerDiv2 = document.createElement("div");
          footerDiv2.id = "smp_footerDiv2";
          contentDiv2.appendChild(footerDiv2);

          footerDiv2.style.width = "90%";
          footerDiv2.style.margin = "0 auto";
          footerDiv2.style.height = "60px";
          footerDiv2.style.lineHeight = "60px";
          footerDiv2.style.textAlign = "center";
          footerDiv2.style.borderTop = "1px solid #ccc";

          // 채팅 입력창
          const messageInput2 = document.createElement("TEXTAREA");
          messageInput2.id = "smp_messageInput2";
          messageInput2.className = "smp_chatScrollbar";
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
          messageButton2.id = "smp_messageButton2";
          messageButton2.className = "smp_no-drag";
          const sendButton2 = document.createTextNode("전송");
          messageButton2.appendChild(sendButton2);
          footerDiv2.appendChild(messageButton2);

          messageButton2.style.width = "65px";
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
          const clientChatBoxDiv = document.getElementById("smpClientChat");
          if (clientChatBoxDiv) {
            clientChatBoxDiv.appendChild(smp_chatDiv2);
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
            clientChatBoxDiv.append(chatBoxImg);
            clientChatBoxDiv.style.setProperty(
              "position",
              "fixed",
              "important"
            );
            clientChatBoxDiv.style.setProperty("bottom", "0", "important");
            clientChatBoxDiv.style.setProperty("right", "0", "important");
            clientChatBoxDiv.style.setProperty("width", "100px", "important");
            clientChatBoxDiv.style.setProperty("height", "100px", "important");
            clientChatBoxDiv.style.setProperty("margin", "0px", "important");
            clientChatBoxDiv.style.setProperty("z-index", "99999", "important");
            // Close
            const chatCloseImg = document.createElement("IMG");
            chatCloseImg.setAttribute(
              "src",
              `http://localhost:5000/chat/image?name=Xicon.png`
            );
            chatCloseImg.setAttribute("alt", "chatCloseButtonImage");
            chatCloseImg.id = "smp_chatCloseImg2";
            chatCloseImg.style.width = "13px";
            chatCloseImg.style.height = "13px";
            chatCloseImg.style.margin = "0";
            chatCloseImg.style.position = "absolute";
            chatCloseImg.style.top = "7.5%";
            chatCloseImg.style.right = "5%";
            chatCloseImg.style.cursor = "pointer";

            titleDiv2.appendChild(chatCloseImg);
            chatBoxImg.onclick = () => {
              chatBoxImg.classList.toggle("chatBoxActive");
              chatCloseImg.onclick = () => {
                chatBoxImg.classList.toggle("chatBoxActive");
                chatBoxImg.style.setProperty("display", "block", "important");
                smp_chatDiv2.style.setProperty("display", "none", "important");
                clientChatBoxDiv.style.setProperty(
                  "position",
                  "fixed",
                  "important"
                );
                clientChatBoxDiv.style.setProperty("bottom", "0", "important");
                clientChatBoxDiv.style.setProperty("right", "0", "important");
                clientChatBoxDiv.style.setProperty(
                  "width",
                  "100px",
                  "important"
                );
                clientChatBoxDiv.style.setProperty(
                  "height",
                  "100px",
                  "important"
                );
                clientChatBoxDiv.style.setProperty(
                  "margin",
                  "0px",
                  "important"
                );
                clientChatBoxDiv.style.setProperty(
                  "z-index",
                  "99999",
                  "important"
                );
              };
              smp_chatDiv2.style.setProperty("display", "block", "important");
              chatBoxImg.style.setProperty("display", "none", "important");
              clientChatBoxDiv.style.setProperty("width", "450px", "important");
              clientChatBoxDiv.style.setProperty(
                "height",
                "550px",
                "important"
              );
            };
          }

          clientDiv2.onclick = () => {
            const messageInput = document.getElementById("smp_messageInput2");
            const dialogDiv = document.getElementById("smp_dialogDiv2");
            const footerDiv = document.getElementById("smp_footerDiv2");
            const empty = isEmpty(messageInput.value);
            const messageButton = document.getElementById("smp_messageButton2");
            focusProcess(dialogDiv, messageInput, footerDiv, messageButton);
            sendCheck(empty, messageButton);
          };
        }
      },
    },

    setManager: class SetManager {
      constructor(id, name) {
        this.id = id;
        this.name = name;
        this.conn = SetManager.connectServer(this.id, this.name);
      }
      static connectServer(id, name) {
        fetch(`http://localhost:5000/chat?CLIENTID=${id}`)
          .then((response) => response.text())
          .then((data) => {
            data = JSON.parse(data);
            commonHTML();
            managerHTML();
            switchButtonCtrl(data.state);
            if (data.state === "on") managerConnect(id, name, data.state);
            document.getElementById("smp_chatSwitch").onclick = function () {
              if (data.state === "off") data.state = "on";
              else data.state = "off";
              switchButtonCtrl(data.state);
              managerConnect(id, name, data.state);
            };
          });
      }
    },
    setClient: class SetClient {
      constructor(id, api, name) {
        this.id = id;
        this.api = api;
        this.name = name;
        this.conn = SetClient.connectServer(this.id, this.api, this.name);
      }
      static connectServer(id, api, name) {
        fetch(`http://localhost:5000/chat?CLIENTID=${id}`)
          .then((response) => response.text())
          .then((data) => {
            data = JSON.parse(data);
            commonHTML();
            clientHTML();
            if (data.state === "on") clientConnect(id, api, name, data.state);
          });
      }
    },
  };

  const clientConnect = (id, api, name, state) => {
    if (state === "on") {
      const socket = io(`ws://localhost:7000/${id}?CHATAPIKEY=${api}`);

      socket.on("connect", () => {
        console.log("Customer Successfully Connected to Server!");
      });
      socket.on("disconnect", (data) => {
        console.log(data);
      });
      socket.on("clientReconnect", () => {
        socket.emit("joinRoom", { username: name });
        return;
      });

      socket.emit("joinRoom", { username: name });

      socket.on("message", (data) => {
        const dialogDiv2 = document.getElementById("smp_dialogDiv2");
        switch (data.type) {
          case "title":
            if (data.title) {
              stopWaitngSign();
              const title2H3 = document.getElementById("smp_title2H3");
              const smp_title2Span = document.getElementById("smp_title2Span");
              title2H3.innerHTML = "online_";
              smp_title2Span.innerHTML = data.title;
              title2H3.appendChild(smp_title2Span);
            }
            return;
          case "system":
            return;
          case "message":
            chatUserDialog(
              name,
              data.logUser,
              data.message,
              data.time,
              dialogDiv2
            );
            return;
          case "dialog":
            const dialog = data.chatLog;
            dialog.map((log) => {
              chatUserDialog(
                name,
                log.user,
                log.message,
                log.simpleTime,
                dialogDiv2
              );
            });
            return;
          default:
            break;
        }
      });
      clientSendMessage(socket, name);
    } else {
      clientConnectAlert();
    }
  };

  const managerConnect = (clientId, managerName, state) => {
    fetch(`http://localhost:5000/chat?CLIENTID=${clientId}&STATE=${state}`)
      .then((response) => response.text())
      .then((data) => {
        data = JSON.parse(data);
        const socket = io(
          `ws://localhost:7000/${clientId}?NICKNAME=${managerName}`
        );
        socket.on("connect", () => {
          if (data.state === "on") {
            console.log(data.message);
            socket.emit("alarm", { managerName });
          } else {
            socket.emit("close");
          }
        });
        socket.on("disconnect", (data) => {
          console.log(data);
        });

        socket.on("managerReconnect", (data) => {
          socket.emit("managerReJoin", { name: data.name });

          managerSendMessage(socket, managerName, data.name);
        });

        socket.on("complete", (data) => {
          if (data.complete) {
            const chatList = document.getElementById("smp_listDiv");
            const user = document.getElementById(`smp_chatList:${data.user}`);
            chatList.removeChild(user);
          }
        });

        socket.on("preview", (data) => {
          if (data.collection) {
            data.collection.map((data) => {
              if (data) {
                const name = data.username;
                const previewData = {
                  name,
                  time: data.chatLog.simpleTime,
                  message: data.chatLog.message,
                  status: data.status,
                  member: data.member,
                };
                chatPreview(previewData);
                clientDialogLogic(socket, name, managerName, clientId);
              }
            });
            // 새로고침시 자동연결 부분
            socket.emit("managerReJoin", { name: data.name });
            managerSendMessage(socket, managerName, data.name);
          } else {
            const previewData = ({
              name,
              time,
              message,
              status,
              member,
            } = data);
            chatPreview(previewData);
            clientDialogLogic(socket, name, managerName, clientId);
          }
        });

        // 아.. 대공사다..
        // common으로 처리할게 아니라 client Dialog도 아이디 값을 넣어서 개별화 시켜 줘야함.

        socket.on("message", (data) => {
          const username = data.name;
          const dialog = data.chatLog;
          if (username) {
            createClientDialog2(username);
            managerSendMessage(socket, managerName, username);
            const dialogDiv = document.getElementById(
              `smp_dialogDiv:${username}`
            );

            switch (data.type) {
              case "managerDialog":
                dialog.map((log) => {
                  chatUserDialog(
                    managerName,
                    log.user,
                    log.message,
                    log.simpleTime,
                    dialogDiv
                  );
                });

                // scroll 최적화
                // const scrollOptimization = (func) => {
                //   let tick = false;

                //   return (trigger = () => {
                //     if (tick) {
                //       return;
                //     }

                //     tick = true;
                //     return requestAnimationFrame(
                //       (task = () => {
                //         tick = false;
                //         return func();
                //       })
                //     );
                //   });
                // };
                // dialogDiv.addEventListener(
                //   "scroll",
                //   scrollOptimization(
                //     loadPrevDialog(dialogDiv, username, socket)
                //   ),
                //   {
                //     passive: true,
                //   }
                // );

                //dialogDiv.addEventListener("scroll", funcTest);

                return;
              case "message":
                chatUserDialog(
                  managerName,
                  data.logUser,
                  data.message,
                  data.time,
                  dialogDiv
                );
                return;
              default:
                break;
            }
          }
        });
      });
  };

  const createClientDialog2 = (username) => {
    document.getElementById(
      "smp_clientDiv"
    ).firstChild.id = `smp_titleDiv:${username}`;
    document.getElementById(
      `smp_titleDiv:${username}`
    ).firstChild.id = `smp_chatUserName:${username}`;
    document.getElementById(
      `smp_titleDiv:${username}`
    ).lastChild.id = `smp_chatComplete:${username}`;
    document.getElementById(
      `smp_chatUserName:${username}`
    ).firstChild.id = `smp_titleH3:${username}`;
    document.getElementById(
      `smp_titleDiv:${username}`
    ).nextSibling.firstChild.id = `smp_dialogDiv:${username}`;
    document.getElementById(
      `smp_dialogDiv:${username}`
    ).nextSibling.id = `smp_footerDiv:${username}`;
    document.getElementById(
      `smp_footerDiv:${username}`
    ).firstChild.id = `smp_messageInput:${username}`;
    document.getElementById(
      `smp_messageInput:${username}`
    ).nextSibling.id = `smp_messageButton:${username}`;

    const titleH3 = document.getElementById(`smp_titleH3:${username}`);
    titleH3.innerText = "online_";
    const titleSpan = document.createElement("span");
    const titleSpanText = document.createTextNode(username);
    titleSpan.appendChild(titleSpanText);
    titleH3.appendChild(titleSpan);
    titleSpan.style.color = "#1E90FF";
    titleSpan.style.fontFamily = "Maven Pro, sans-serif";
    titleSpan.style.fontWeight = "600";
    titleSpan.style.fontSize = "1.5em";
    const chatComplete = document.getElementById(
      `smp_chatComplete:${username}`
    );
    chatComplete.style.display = "inline-block";

    const clientDiv = document.getElementById("smp_clientDiv");
    clientDiv.onclick = () => {
      const messageInput = document.getElementById(
        `smp_messageInput:${username}`
      );
      const dialogDiv = document.getElementById(`smp_dialogDiv:${username}`);
      const footerDiv = document.getElementById(`smp_footerDiv:${username}`);
      const empty = isEmpty(messageInput.value);
      const messageButton = document.getElementById(
        `smp_messageButton:${username}`
      );
      focusProcess(dialogDiv, messageInput, footerDiv, messageButton);

      sendCheck(empty, messageButton);
    };
  };

  const createClientDialog = (username) => {
    const clientDiv = document.getElementById("smp_clientDiv");
    while (clientDiv.firstChild) {
      clientDiv.removeChild(clientDiv.lastChild);
    }

    // 제목 div
    const titleDiv = document.createElement("div");
    titleDiv.id = `smp_titleDiv:${username}`;
    clientDiv.appendChild(titleDiv);

    titleDiv.style.width = "80%";
    titleDiv.style.height = "50px";
    titleDiv.style.lineHeight = "50px";
    titleDiv.style.margin = "0 auto";
    titleDiv.style.borderBottom = "1px solid #ddd";

    // 제목 text
    const chatUserName = document.createElement("div");
    chatUserName.id = `smp_chatUserName:${username}`;
    const titleH3 = document.createElement("h3");
    titleH3.id = `smp_titleH3:${username}`;
    titleH3.className = "smp_no-drag";
    chatUserName.appendChild(titleH3);
    titleDiv.appendChild(chatUserName);
    const titleSpan = document.createElement("span");
    titleH3.appendChild(titleSpan);

    chatUserName.style.display = "inline-block";
    chatUserName.style.width = "70%";
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
    chatCloseImg.style.width = "13px";
    chatCloseImg.style.height = "13px";
    chatCloseImg.style.margin = "0";
    chatCloseImg.style.position = "absolute";
    chatCloseImg.style.top = "7%";
    chatCloseImg.style.right = "4%";
    chatCloseImg.style.cursor = "pointer";

    titleDiv.appendChild(chatCloseImg);

    // 내용 div
    const contentDiv = document.createElement("div");
    clientDiv.appendChild(contentDiv);

    const dialogDiv = document.createElement("div");
    dialogDiv.id = `smp_dialogDiv:${username}`;
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
    footerDiv.id = `smp_footerDiv:${username}`;
    contentDiv.appendChild(footerDiv);

    footerDiv.style.width = "80%";
    footerDiv.style.margin = "0 auto";
    footerDiv.style.height = "60px";
    footerDiv.style.lineHeight = "60px";
    footerDiv.style.textAlign = "center";
    footerDiv.style.borderTop = "1px solid #ccc";

    // 채팅 입력창
    const messageInput = document.createElement("TEXTAREA");
    messageInput.id = `smp_messageInput:${username}`;
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
    messageInput.style.fontFamily = "TmoneyRoundWindRegular, sans-serif";
    messageInput.style.resize = "none";
    messageInput.style.overflow = "hidden"; // firefox min-height 적용을 위해서 ..
    messageInput.addEventListener("focus", function () {
      this.style.outline = "#ccc";
    });

    // 채팅 보내기 버튼
    const messageButton = document.createElement("BUTTON");
    messageButton.id = `smp_messageButton:${username}`;
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
  };

  const clientConnectAlert = () => {
    const systemLogDiv = document.getElementById("smp_dialogDiv2");
    const systemLog = document.createElement("div");
    systemLog.style.width = "75%";
    systemLog.style.display = "block";
    systemLog.style.textAlign = "center";
    systemLog.style.margin = "0 auto";
    const systemLogP = document.createElement("p");
    systemLogP.style.background = "#ccc";
    systemLogP.style.borderRadius = "15px";
    systemLogP.style.height = "25px";
    systemLogP.style.lineHeight = "25px";
    systemLogP.style.color = "#555";

    const systemLogMsg = document.createTextNode("상담 가능 시간이 아닙니다.");
    systemLogDiv.appendChild(systemLog);
    systemLogP.appendChild(systemLogMsg);
    systemLog.appendChild(systemLogP);
  };
  let jumjumjum = null;
  const waitingSign = (dom, count) => {
    if (dom) {
      jumjumjum = setInterval(() => {
        if (count === 1) {
          dom.innerHTML = ".";
          count = count + 1;
        } else if (count === 2) {
          dom.innerHTML = "..";
          count = count + 1;
        } else if (count === 3) {
          dom.innerHTML = "...";
          count = 1;
        }
      }, 1000);
    }
  };
  const stopWaitngSign = () => {
    if (jumjumjum) {
      clearInterval(jumjumjum);
    }
  };
  const clientSendMessage = (socket, username) => {
    let count = 0;
    const messageButton2 = document.getElementById("smp_messageButton2");
    const messageInput2 = document.getElementById("smp_messageInput2");

    messageButton2.onclick = () => {
      socket.emit("message", {
        message: messageInput2.value,
        username: username,
      });
      messageInput2.value = "";
      messageInput2.focus();
      count = count + 1;
      const titleText = document.getElementById("smp_title2Span").innerText;
      if (count === 1 && titleText === "on!") {
        const dom = document.getElementById("smp_title2Span");
        const domTitle = document.getElementById("smp_title2H3");
        domTitle.innerHTML = "접속 대기중";
        dom.innerHTML = "";
        domTitle.appendChild(dom);
        waitingSign(dom, count);
      }
    };
    messageInput2.onkeyup = (e) => {
      // only enter
      if (e.which === 13 && !e.ctrlKey) {
        if (!messageButton2.disabled) {
          count = count + 1;
          const titleText = document.getElementById("smp_title2Span").innerText;
          if (count === 1 && titleText === "on!") {
            const dom = document.getElementById("smp_title2Span");
            const domTitle = document.getElementById("smp_title2H3");
            domTitle.innerHTML = "접속 대기중";
            dom.innerHTML = "";
            domTitle.appendChild(dom);
            waitingSign(dom, count);
          }
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
  const dd = ["hi"];
  
  const managerSendMessage = (socket, manager, username) => {
    const messageButton = document.getElementById(
      `smp_messageButton:${username}`
    );

    const messageInput = document.getElementById(
      `smp_messageInput:${username}`
    );
    if (messageButton && messageInput) {
      messageButton.onclick = () => {
        socket.emit("message", {
          message: messageInput.value,
          manager,
          username,
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
              manager,
              username,
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
    }
  };
  const chatPreview = (data) => {
    const name = data.name;
    const user = document.getElementById(`smp_chatUser:${name}`);

    if (user !== null) {
      // 이미 프리뷰에 데이터가 있는 경우
      if (name === user.innerHTML) {
        previewAlarm(data);
      }
      // 처음 프리뷰가 생기는 경우
    } else {
      createPreview(data);
    }
  };
  
  const createPreview = (data) => {
    const { name, time, message, status, member } = data;


    if (status === "chatting" && member.length === 1) {
      const alarm = alarmAnimation();
      alarm.start(list);
    }
  };
  const deleteClientDiv = () => {
    const clientDiv = document.getElementById(`smp_clientDiv`);
    const titleDiv = document.getElementById(`smp_titleDiv`);
    clientDiv.removeChild(titleDiv);
    clientDiv.removeChild(clientDiv.lastChild);
  };

  const loadPrevDialog = (dialogDiv, username, socket) => {
    const scrollTop = Math.round(dialogDiv.scrollTop);

    if (scrollTop === 0) {
      const name = username;
      socket.emit("scrollLoad", { name: name });
    }
    return;
  };

  const clientDialogLogic = (socket, name, managerName, clientId) => {
    const chatList = document.getElementById(`smp_chatList:${name}`);
    chatList.onclick = () => {
      const dialogDiv = document.getElementById(`smp_dialogDiv:test1`);
      //dialogDiv.removeEventListener("scroll",funcTest);
      // 관리자채팅창 attr 변경
      createClientDialog2(name);
      // 기존 채팅내역뷰 삭제
      deleteDialog(name);
      // 채팅룸 변경
      socket.emit("roomEnterExit", { name, clientId, managerName });
      // 메세지보내기 기능
      managerSendMessage(socket, managerName, name);

      // 프리뷰 알람 제거
      const alarm = alarmAnimation();
      alarm.stop(chatList);
      //상담이 완료되면
      const chatComplete = document.getElementById(`smp_chatComplete:${name}`);
      chatComplete.onclick = () => {
        chatComplete.style.display = "none";
        const chatUser = document.getElementById(`smp_chatUser:${name}`);
        const username = chatUser.innerHTML;
        if (name === username) {
          socket.emit("complete", { name, clientId, managerName });
        } else {
          return alert("새로고침이 필요합니다.");
        }
      };
    };
  };
  const deleteDialog = (username) => {
    const dialogDiv = document.getElementById(`smp_dialogDiv:${username}`);
    while (dialogDiv.firstChild) {
      dialogDiv.removeChild(dialogDiv.lastChild);
    }
  };

  const createTitleLine = (name) => {
    const titleH3 = document.getElementById("smp_titleH3");
    titleH3.innerText = "online_";
    const titleSpan = document.createElement("span");
    const titleSpanText = document.createTextNode(name);
    titleSpan.appendChild(titleSpanText);
    titleH3.appendChild(titleSpan);
    titleSpan.style.color = "#1E90FF";
    titleSpan.style.fontFamily = "Maven Pro, sans-serif";
    titleSpan.style.fontWeight = "600";
    titleSpan.style.fontSize = "1.5em";

    const chatComplete = document.getElementById(`smp_chatComplete:${name}`);
    chatComplete.style.display = "inline-block";
  };
  const chatUserDialog = (user, logUser, message, time, dialogDiv) => {
    const clientLog = document.createElement("div");
    clientLog.style.width = "75%";
    clientLog.style.display = "inline-block";
    clientLog.style.textAlign = "right";
    clientLog.style.margin = "5px 0 5px 25%";
    const clientLogP = document.createElement("p");
    clientLogP.style.maxWidth = "87%";
    clientLogP.style.display = "inline-block";
    clientLogP.style.backgroundColor = "#1E90FF";
    clientLogP.style.borderRadius = "10px";
    clientLogP.style.padding = "7px 10px 7px 10px";
    clientLogP.style.color = "#fff";
    clientLogP.style.margin = "0";
    clientLogP.style.textAlign = "left";
    clientLogP.style.whiteSpace = "pre-line";
    clientLogP.style.wordBreak = "break-all";
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
    someoneLog.style.margin = "5px 25% 5px 0";
    const someoneLogP = document.createElement("p");
    someoneLogP.style.maxWidth = "87%";
    someoneLogP.style.display = "inline-block";
    someoneLogP.style.backgroundColor = "#D9E5FF";
    someoneLogP.style.borderRadius = "10px";
    someoneLogP.style.padding = "7px 10px 7px 10px";
    someoneLogP.style.color = "#696969";
    someoneLogP.style.margin = "0";
    someoneLogP.style.textAlign = "left";
    someoneLogP.style.whiteSpace = "pre-line";
    someoneLogP.style.wordBreak = "break-all";
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
  const isEmpty = (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (value !== null &&
        typeof value === "object" &&
        !Object.keys(value).length)
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

  const focusProcess = (dialogDiv, messageInput, footerDiv, messageButton) => {
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
  const previewAlarm = (data) => {
    const { name, time, message, status, member } = data;
    // 멤버도 가져와서 관리자가 현재 채팅중인 사람인지도 체크해야함.
    // 내가 들어가 있으면 빛나지 않고 내가 없으면 빛나야 한다.
    // 1:1 채팅 시스템상 다른 상담자가 들어가 있으면 빛나지 않아야 한다. 혹은 다른 색을 낸다.

    if (status === "chatting") {
      document.getElementById(`smp_chatDate:${name}`).innerHTML = time;
      document.getElementById(`smp_chatContent:${name}`).innerHTML = message;
    }
    if (status === "chatting" && member.length === 1) {
      const list = document.getElementById(`smp_chatList:${name}`);
      const alarm = alarmAnimation();
      alarm.start(list);
    }
  };
  let reqAniFram = null;
  let reqAniFramObj = [];
  const alarmAnimation = () => {
    return {
      start: (dom) => {
        let op = 0.1;
        let tempOp = 0;
        let tempOp2 = 1;
        let temp = 0;
        const opacityCtrl = (timeStamp) => {
          if (temp === 0) temp = timeStamp;
          const interval = timeStamp - temp;
          // interval 간격을 조절
          if (interval > 150) {
            if (op === 1) {
              if (tempOp2 < 1) {
                tempOp = tempOp2;
              } else {
                tempOp = op;
              }
              // 0.9 일때 op 1을저장하면 안된다.
              tempOp = Math.round((tempOp - 0.1) * 1e12) / 1e12; // 0.8 // 0.7
              dom.style.border = `5px solid rgba(255,255,0,${tempOp})`;
              dom.style.outline = `5px solid rgba(255,255,0,${tempOp})`;
              dom.style.boxShadow = `inset 0 2px 45px rgba(255,255,0,${tempOp})`;
              if (tempOp === 0.1) {
                op = tempOp;
                tempOp = 0;
                tempOp2 = 1;
              } else {
                tempOp2 = tempOp; // 0.9 // 0.8
              }
            } else {
              op = Math.round((op + 0.1) * 1e12) / 1e12;
              dom.style.border = `5px solid rgba(255,255,0,${op})`;
              dom.style.outline = `5px solid rgba(255,255,0,${op})`;
              dom.style.boxShadow = `inset 0 2px 45px rgba(255,255,0,${op})`;
            }
            temp = timeStamp;
          }
          reqAniFram = requestAnimationFrame(opacityCtrl);
        };
        requestAnimationFrame(opacityCtrl);
        reqAniFramObj.push(dom.id);
      },
      stop: (dom) => {
        if (reqAniFram) {
          for (let i = 0; i < reqAniFramObj.length; i++) {
            if (reqAniFramObj[i] === dom.id) {
              let reqAniFramNumber = reqAniFramObj.length - 1 - i;
              const cancelBoxNumber = reqAniFram - reqAniFramNumber;
              cancelAnimationFrame(cancelBoxNumber);
              reqAniFramObj.splice(i, 1);
            }
          }
          dom.style.border = `none`;
          dom.style.outline = `none`;
          dom.style.boxShadow = `none`;
        }
      },
    };
  };

  const scrollChatLoad = (socket, domName, name) => {
    const scrollHeight = dialogDiv.offsetHeight;

    // 스크롤에 따른 대화내역 불러오기
    dialogDiv.addEventListener("scroll", function (e) {
      requestAnimationFrame(() => {
        const scrollTop = Math.round(dialogDiv.scrollTop);
        if (scrollTop === 0) {
          socket.emit("scrollLoad", { name });
        }
      });
    });
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
