import Router from "koa-router";
// 회원정보 전달 API
import auth from "./auth";
// 사진 전달 API
import photo from "./photo";
// 채팅 API
import chat from "./smpChat";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/cloud", photo.routes());
api.use("/smpChat", chat.routes());

export default api;
