import dotenv from "dotenv";
dotenv.config({path:'/var/www/smp-resource-server/.evn'});
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import api from "./api/index.js";

const app = new Koa();
const router = new Router();

app.use(bodyParser());

router.use(api.routes());

app.use(cors());

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 5050;
export const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
