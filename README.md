# SMP Resource Server

`SMP Resource Server`는 Oauth Server에서 생성된 Aeccess Token을 인증키로 User Data, JS, CSS, Image 등을 제공하는 서버입니다.  
최초에는 `SMP Oauth Login`의 User Data 전달을 위해 제작되었으나 Third Party Api를 통한 `SMP Chat Service` 배포 등, 추가 프로젝트 활용에 사용되고 있습니다.

<br>

## Version

`SMP Resource Server`_(v1.1.2)_

<br>

#### Update

`SMP Resource Server`_(v1.0.0)_

- smp Chat Service api를 통한 access_token 인증 및 user-data 전달

`SMP Resource Server`_(v1.0.1)_

- smp Chat Service api를 통한 image 저장 및 전송

`SMP Resource Server`_(v1.1.1)_

- smp Chat Service 전용 port 증설
- smp Chat Service api를 통한 chatService.js 배포
- smp Chat Service api를 통한 smpChatService.css 배포

`SMP Resource Server`_(v1.1.2)_

- smp Chat Service api를 통한 smpChatService.min.js 배포
  <br>

## IDE

<img alt="vscode" src ="https://img.shields.io/badge/VSCode-v1.57-007ACC.svg?&flat&logo=appveyor&logo=VisualStudioCode&logoColor=white"/> <img alt="nodejs" src ="https://img.shields.io/badge/NodeJS-v12.16.4- 339933.svg?&flat&logo=appveyor&logo=Node.js&logoColor=white"/> <img alt="Koa" src ="https://img.shields.io/badge/Koa-v2.13.1-012169.svg?&flat&logo=appveyor&logo=Koa&logoColor=white"/> <img alt="MongoDB" src ="https://img.shields.io/badge/MongoDB-v4.4.6-47A248.svg?&flat&logo=appveyor&logo=MongoDB&logoColor=white"/> <img alt="Ubuntu" src ="https://img.shields.io/badge/Ubuntu-v18.04.5 LTS-E95420.svg?&flat&logo=appveyor&logo=Ubuntu&logoColor=white"/> <img alt="NGINX" src ="https://img.shields.io/badge/Nginx-v1.14.0-009639.svg?&flat&logo=appveyor&logo=NGINX&logoColor=white"/> <img alt="Amazon AWS" src ="https://img.shields.io/badge/AWS-EC2 Prettier-232F3E.svg?&flat&logo=appveyor&logo=AmazonAWS&logoColor=white"/>

- **Tool** - `VSCode`_(v1.57)_
- **Back End** - `NodeJS(Koa)`_(v12.16.4)_, `ES6 Module`
- **Data Base** - `MongoDB(Mongoose)`_(v4.4.6)_
- **Web Server** - `Ubuntu`_(v18.04.5 LTS)_, `Nginx`_(v1.14.0)_
- **Cloud Computing** - `AWS EC2 Prettier`

<br>

## Usage

#### End Point

- **User Info** (/scope)

```javascript
// ex) Axios Request
this.smp_resource = axios.create({
  baseURL: 'https://smp-resource.link/auth/',
});

const response = await this.smp_resource.get('scope');

const userData = response.data.userData;
```

```javascript
// Smp Resource Server Response, End point : scope
const token = ctx.header.authorization.split('bearer ')[1];

/*    ....Verification Process    */

ctx.code = 200;
ctx.body = { userData };
```

<br>

- **Smp Chat Service JS** (/chatService.js)

```javascript
// ex) Script Load Request
const clientId = process.env.REACT_APP_CLIENT_ID;

this.script = document.createElement('script');
this.script.src = `https://smp-resource.link/smpChat/chatService.js?CLIENTID=${clientId}`;
```

```javascript
// Smp Resource Server Response, End point : chatService.js
const clientID = ctx.query.CLIENTID;

/*    ....Verification Process    */

const filename = __dirname + '/smpChatService.min.js';
const data = fs.readFileSync(filename, 'utf8');

ctx.code = 200;
ctx.type = 'text/javascript';
ctx.body = data;
```

<br>

- **Smp Chat Service CSS** (/chatService.css)

```javascript
// ex) Link Load Request

this.link = document.createElement('link');
this.link.rel = 'stylesheet';
this.link.href = 'https://smp-resource.link/smpChat/chatService.css';
```

```javascript
// Smp Resource Server Response, End point : chatService.css

const cssName = __dirname + '/smpChatService.css';
const css = fs.readFileSync(cssName, 'utf8');

ctx.code = 200;
ctx.type = 'text/css';
ctx.body = css;
```

<br>

#### Comment

`smpark` - 이번 프로젝트는 `Smp Oauth Server` 프로젝트와 함께 만들어본 프로젝트 입니다.  
인증 서버와 리소스 서버라는 차이점 외에도 이번 프로젝트는 인증 서버와 다르게 ES6 Module을 사용해 제작해 보았고 BE에서 Express 대신 Koa를 사용해 보았습니다.  
이미 많은 게 준비되어 있는 Express와 다르게 최소한의 상태에서 필요한 것만 설치하여 사용한다는 점이 매력적이었고 가벼운 느낌이었습니다.  
리소스 서버인 만큼 앞으로 개인적인 프로젝트 사용에 있어서 적극적으로 사용하고 업데이트해 나가고 싶은 프로젝트입니다.  
Readme는 여기까지입니다. 읽어주셔서 감사합니다.
