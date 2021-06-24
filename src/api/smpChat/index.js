import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import {
  verifyClientId,
  judgeUserType,
  registerManager,
  getServerState,
} from '../../services/chat/chat.ctrl.js';

const __dirname = path.resolve();
const smpChat = new Router();

smpChat.get('/image', (ctx) => {
  const name = ctx.query.name;
  const filename = path.join(__dirname, `/../../public/image/${name}`);
  const data = fs.readFileSync(filename);

  ctx.body = data;
});

smpChat.get('/sound', (ctx) => {
  const name = ctx.query.name;

  const filename = path.join(__dirname, `/../../public/sound/${name}`);

  const audio = fs.createReadStream(filename);

  ctx.set('Content-Type', 'audio/mp3');

  ctx.body = audio;
});

smpChat.get('/chatService.js', async (ctx) => {
  const clientID = ctx.query.CLIENTID;

  if (!clientID || clientID === null) {
    ctx.status = 401;
    ctx.body = 'CLIENTID가 누락되었습니다.';
  }

  const verifyResult = await verifyClientId(clientID);

  if (!verifyResult.result) {
    ctx.status = setResult.code;
    ctx.body = setResult.message;
  }

  const filename = __dirname + '/smpChatService.min.js';
  const data = fs.readFileSync(filename, 'utf8');

  ctx.type = 'text/javascript';
  ctx.body = data;
});

smpChat.get('/chatService.css', (ctx) => {
  const cssName = __dirname + '/smpChatService.css';
  const datacss = fs.readFileSync(cssName, 'utf8');

  ctx.type = 'text/css';
  ctx.body = datacss;
});

smpChat.get('/', async (ctx) => {
  const { clientId, userId } = ctx.query;
  const userType = await judgeUserType(clientId, userId);
  const data = { clientId, userId, userType };
  let state = '';

  await registerManager(data);

  state = await getServerState(data);

  ctx.body = { type: userType, state };
});

export default smpChat;
