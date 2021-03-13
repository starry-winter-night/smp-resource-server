// import Member from '../../models/member';
import Oauth from "../models/oauth";

import jwt from "jsonwebtoken";
import fs from "fs";
import mime from "mime";

export const apiPhoto = async (ctx) => {
  try {
    const token = ctx.header.authorization.split("Bearer ")[1];
    const oauth = await Oauth.findByAccesstoken(token);

    if (!oauth) {
      ctx.status = 501;
      ctx.body = { message: "일치하는 accessToken 정보가 없습니다." };
      return;
    }
    if (!token) {
      ctx.status = 501;
      ctx.body = { message: "accessToken이 존재하지 않습니다." };
      return;
    }
    if (token != oauth.token.accessToken) {
      ctx.status = 501;
      ctx.body = { message: "accessToken 정보가 일치하지 않습니다." };
      return;
    }

    jwt.verify(
      token,
      process.env.OAUTH_JWT_ACCESS_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          ctx.body = {
            message: "accessToken의 유효기간이 만료되었습니다.",
            request: "photo",
            token: "update",
          };
          return;
        }
      }
    );
    const dir = "src/public/image";
    const name = fs.readdirSync(dir);
    const path = `src/public/image/${name[0]}`;
    const imgMime = mime.getType(path);
    const data = fs.readFileSync(path, "base64");
    ctx.type = `application/${imgMime}`;
    ctx.status = 200;
    ctx.body = { data: data };
  } catch (e) {
    console.log(e);
  }
};
