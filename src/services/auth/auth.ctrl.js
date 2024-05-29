import Member from '../../models/member.js';
import Oauth from '../../models/oauth.js';
import { loadUserInfo } from './auth.functions.js';
import jwt from 'jsonwebtoken';

export const scope = async (token) => {
  const decoded = jwt.verify(token, process.env.SMPARK_JWT_ACCESS_SECRET_KEY);
  const oauth = await Oauth.findByClientId(decoded.id);
  const userInfo = await Member.findByUsername(decoded.user);
  const reqInfo = oauth.client.reqInfo;
  // 유저 정보 가져오기  [속성1:요구 정보][속성2:실제 owner정보목록]
  const resultUserInfo = loadUserInfo(reqInfo, userInfo);
  return resultUserInfo;
};
