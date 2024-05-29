import mongoose from '../config/db.js';
const { Schema } = mongoose;

const authSchema = new Schema(
  {
    authorizationCode: {
      authorizationCode: String, // 코드가 포함된 문자열
      expiresAt: {
        type: Date,
      },
      redirectUri: String, // 리디렉션 할 문자열
      user: String, // 프로토콜을 유연하게 사용할 수 있다.
    },
    client: {
      // 이 서버로 인증을 원하는 어플리케이션
      clientId: String, // 클라이언트를 나타내는 고유한 문자열
      clientSecret: String, // 클라이언트의 암호, null일 수 있음
      grants: [], // 클라이언트가 사용할 수 있는 보조 배열('authorization_code')
      redirectUris: String, // 클라이언트가 리디렉션 할 수 있는 url 배열
      reqInfo: {}, // 요청한 정보
      appName: String,
      homepageAddr: String,
      username: String,
      chatApiKey: String,
      chatManagerList: [],
    },
    token: {
      accessToken: String, // 서버가 생성한 액세스 토큰
      accessTokenExpiresAt: {
        type: Date,
      },
      client: String, // 이 토큰과 연결된 클라이언트
      _id: mongoose.Types.ObjectId, // 이 토큰과 연결된 사용자
    },
  },
  {
    timestamps: { currentTime: () => Date.now() + 3600000 * 9 },
  }
);

authSchema.statics.findByAccesstoken = function (token) {
  return this.findOne({ 'token.accessToken': token }, { 'client.clientSecret': false });
};

authSchema.statics.findByClientId = function (client_id) {
  return this.findOne({ 'client.clientId': client_id }, { 'client.clientSecret': 0 });
};

authSchema.statics.findByChatApiKey = function (apiKey) {
  return this.findOne({ 'client.chatApiKey': apiKey }, { 'client.clientSecret': false });
};

const Oauth = mongoose.model('oauth', authSchema);
export default Oauth;
