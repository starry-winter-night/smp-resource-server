import Oauth from "../models/oauth";
import jwt from "jsonwebtoken";
export const tokenVerify = async (ctx, next) => {
  const token = ctx.header.authorization.split("Bearer ")[1];
  
  const oauth = await Oauth.findByAccesstoken(token);
 
  if (!oauth) {
    ctx.status = 401;
    ctx.body = { message: "일치하는 accessToken 정보가 없습니다." };
  }
  if (!token) {
    ctx.status = 401;
    ctx.body = { message: "accessToken이 존재하지 않습니다." };
  }
  if (token != oauth.token.accessToken) {
  
    ctx.status = 401;
    ctx.body = { message: "accessToken 정보가 일치하지 않습니다." };
  }
  const jwtResult = jwtVerify(token);
  if (!jwtResult) {
    ctx.status = 401;
    ctx.body = {
      message: "accessToken의 유효기간이 만료되었습니다.",
      request: "scope",
      token: "update",
    };
  }
  await next();
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
