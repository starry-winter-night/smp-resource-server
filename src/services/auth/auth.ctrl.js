import Member from '../../models/member';
import Oauth from '../../models/oauth';
import { loadUserInfo } from './auth.functions';

export const scope = async (token) => {
  const oauth = await Oauth.findByAccesstoken(token);
  const userId = oauth.token._id;
  const userInfo = await Member.findById(userId);
  const reqInfo = oauth.client.reqInfo;
  // 유저 정보 가져오기  [속성1:요구 정보][속성2:실제 owner정보목록]
  const resultUserInfo = loadUserInfo(reqInfo, userInfo);
  return resultUserInfo;
};
