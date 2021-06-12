import Router from 'koa-router';
import { scope } from '../../services/auth/auth.ctrl';
import { tokenVerify } from '../../lib/tokenVerifyMid';
const auth = new Router();

auth.get('/scope', tokenVerify, async (ctx) => {
  let token = ctx.header.authorization.split('Bearer ')[1];

  if (!token) token = ctx.header.authorization.split('bearer ')[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: 'accessToken이 존재하지 않습니다.' };
  }

  const scopeResult = await scope(token);
  const successCode = 200;
  ctx.status = successCode;
  ctx.body = { userData: scopeResult };
});

export default auth;
