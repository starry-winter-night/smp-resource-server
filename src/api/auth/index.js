import Router from "koa-router";
import { scope } from "../../services/auth/auth.ctrl";
import { tokenVerify } from "../../lib/tokenVerifyMid";
const auth = new Router();

auth.get("/scope", tokenVerify, async (ctx) => {
  const token = ctx.headers.authorization.split("Bearer ")[1];
  const scopeResult = await scope(token);
  const successCode = 200;
  ctx.status = successCode;
  ctx.body = { userData: scopeResult };
});

export default auth;
