import Router from "koa-router";
import { apiPhoto } from "../../services/photo/photo.ctrl.js";
import { tokenVerify } from "../../lib/tokenVerifyMid.js";
const photo = new Router();

photo.get("/photo", tokenVerify, (ctx) => {
  const photoResult = apiPhoto();
  const { imgMime, baseData } = photoResult;
  const successCode = 200;
  ctx.type = `application/${imgMime}`;
  ctx.status = successCode;
  ctx.body = { data: baseData };
});

export default photo;
