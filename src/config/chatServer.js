import Koa from 'koa';
const smpChatApp = new Koa();
import cors from '@koa/cors';

smpChatApp.use(cors());

const port = process.env.CHAT_PORT || 7070;

export const httpServer = smpChatApp.listen(port, () => {
  console.log(`Chat Listening To port ${port}`);
});