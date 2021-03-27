import mongoose from "../config/db";
const { Schema } = mongoose;

const smpChatSchema = new Schema({
  clientId: String,
  chatApiKey: String,
  nameSpace: String,
  registerTime: String,
  manager: [
    {
      serverState: String,
      managerId: String,
      registerTime: String,
      chatRoomHistory: [
        {
          seq: Number,
          userId: String,
          roomName: String,
          registerTime: String,
        },
      ],
    },
  ],
  client: [
    {
      serverState: String,
      userId: String,
      registerTime: String,
      roomMember: [],
      chatLog: [
        {
          seq: Number,
          userId: String,
          manager: String,
          message: String,
          image: String,
          registerTime: String,
        },
      ],
    },
  ],
});

smpChatSchema.statics.findByClientId = function (clientId) {
  return this.findOne({ clientId });
};

smpChatSchema.statics.findByChatApiKey = function (chatApiKey) {
  return this.findOne({ chatApiKey });
};

/* update를 statics로 사용한 이유 : 
   findOne로 최상위 문서를 찾은 뒤 그안에 요소를 
   업데이트 하려 했으나 array 요소를 업데이트 하는 
   과정에서 조건으로 찾는 요소가 최상위가 아니므로 
   오류가 나타나게 된다. 
   즉, 업데이트에 사용할 조건이 최상위어야 한다.   
*/
smpChatSchema.statics.updateByServerState = function (
  _id,
  userId,
  serverState,
  userType
) {
  if (userType === "manager") {
    return this.updateOne(
      { _id, "manager.managerId": userId },
      { $set: { "manager.$.serverState": serverState } }
    );
  }
  return this.updateOne(
    { _id, "client.userId": userId },
    { $set: { "client.$.serverState": serverState } }
  );
};

smpChatSchema.statics.updateByRoomMember = function (_id, userId) {
  return this.updateOne(
    { _id, "client.userId": userId },
    { $addToSet: { "client.$.roomMember": userId } }
  );
};

smpChatSchema.statics.updateByMessage = function (_id, chatLog) {
  return this.updateOne(
    { _id, "client.userId": chatLog.userId },
    { $addToSet: { "client.$.chatLog": chatLog } }
  );
};

smpChatSchema.methods.updateByIdAndState = function (
  userId,
  serverState,
  registerTime,
  userType
) {
  if (userType === "manager") {
    return this.updateOne({
      $addToSet: {
        manager: { managerId: userId, registerTime, serverState },
      },
    });
  }
  return this.updateOne({
    $addToSet: {
      client: { userId, serverState, registerTime },
    },
  });
};

const SmpChat = mongoose.model("smpChat", smpChatSchema);
export default SmpChat;
