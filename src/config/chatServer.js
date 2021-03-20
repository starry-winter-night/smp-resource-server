import Koa2 from 'koa';
const smpChatApp = new Koa2();
import cors from '@koa/cors';

smpChatApp.use(cors());

const port = process.env.CHATSERVERPORT || 7070;

export const httpServer = smpChatApp.listen(port, () => {
  console.log(`Chat Listening To port ${port}`);
});