import mongoose from "../config/db";
const { Schema } = mongoose;

const smpChatSchema = new Schema({
  clientId: String,
  chatApiKey: String,
  nameSpace: String,
  manager: [
    {
      serverState: String,
      managerId: String,
      chatRoomHistory: [
        {
          seq: Number,
          clientName: String,
          roomName: String,
        },
      ],
    },
  ],
  client: [
    {
      userId: String,
      currentMember: [],
      chatLog: [
        {
          seq: Number,
          user: String,
          message: String,
          simpleTime: String,
          currentTime: String,
          manager: String,
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
  id,
  managerId,
  serverState
) {
  return this.updateOne(
    { _id: id, "manager.managerId": managerId },
    { $set: { "manager.$.serverState": serverState } }
  );
};

smpChatSchema.methods.updateByIdAndState = function (managerId, serverState) {
  return this.updateOne({
    $addToSet: {
      manager: { managerId, serverState },
    },
  });
};

const SmpChat = mongoose.model("smpChat", smpChatSchema);
export default SmpChat;
