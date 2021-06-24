import Oauth from '../models/oauth.js';
import jwt from 'jsonwebtoken';
export const tokenVerify = async (ctx, next) => {
  if (ctx.header.authorization) {
    let token = ctx.header.authorization.split('Bearer ')[1];

    if (!token) token = ctx.header.authorization.split('bearer ')[1];

    if (!token) {
      ctx.status = 401;
      ctx.body = { message: 'accessToken이 존재하지 않습니다.' };
    }

    const oauth = await Oauth.findByAccesstoken(token);

    if (!oauth) {
      ctx.status = 401;
      ctx.body = { message: '일치하는 accessToken 정보가 없습니다.' };
    } else if (token != oauth.token.accessToken) {
      ctx.status = 401;
      ctx.body = { message: 'accessToken 정보가 일치하지 않습니다.' };
    }
    const jwtResult = jwtVerify(token);

    if (!jwtResult) {
      ctx.status = 401;
      ctx.body = {
        message: 'accessToken의 유효기간이 만료되었습니다.',
        request: 'scope',
        token: 'update',
      };
    }
    await next();
  } else {
    ctx.status = 401;
    ctx.body = { message: 'accessToken이 존재하지 않습니다.' };
  }
};

export const jwtVerify = (token) => {
  const key = process.env.OAUTH_JWT_ACCESS_SECRET_KEY;

  const data = jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return false;
    }
    return decoded;
  });
  return data;
};
