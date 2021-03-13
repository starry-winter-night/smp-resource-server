import Koa2 from 'koa';
const chatApp = new Koa2();
import cors from '@koa/cors';

chatApp.use(cors());

const port = process.env.CHATSERVERPORT || 7070;

export const httpServer = chatApp.listen(port, () => {
  console.log(`Chat Listening To port ${port}`);
});