import mongoose from "../config/db";
const { Schema } = mongoose;

const chatManagerSchema = new Schema({
  managerId: String,
  clientId: String,
  nameSpace: String,
  socketId: String,
  chatState: String,
  nickName: String,
  chatApiKey: String,
  chatTime: {
    startTime: {
      second: String,
      minute: String,
      hour: String,
      week: [],
    },
    endTime: {
      second: String,
      minute: String,
      hour: String,
      week: [],
    },
  },
  managerMember: String,
  JoiningChatRoom: [
    {
      clientName: String,
      roomName: String,
    },
  ],
});
chatManagerSchema.statics.findByChatApiKey = function (apiKey) {
  return this.findOne({ chatApiKey: apiKey });
};
chatManagerSchema.statics.findByUsername = function (username) {
  return this.findOne({ managerId: username });
};
chatManagerSchema.statics.findByNameSpace = function (nameSpace) {
  return this.findOne({ nameSpace });
};
chatManagerSchema.statics.findByClientId = function (clientId) {
  return this.findOne({ clientId });
};
chatManagerSchema.statics.findByManagerMember = function (managerMember) {
  return this.findOne({ managerMember });
};
chatManagerSchema.statics.findBySocketId = function (socketId) {
  return this.findOne({ socketId });
};
// chatManagerSchema.statics.findBychatState = function (chatState) {
//   return this.find({ chatState });
// };
chatManagerSchema.methods.updateByNickName = function (nickName) {
  return this.updateOne({ nickName });
};
chatManagerSchema.methods.updateByNameSpace = function (nameSpace) {
  return this.updateOne({ nameSpace });
};
chatManagerSchema.methods.updateByChatState = function (chatState) {
  return this.updateOne({ chatState });
};
chatManagerSchema.methods.updateBySocketId = function (socketId) {
  return this.updateOne({ socketId });
};
chatManagerSchema.methods.updateBychatTime = function (op) {
  return this.updateOne({
    chatTime: {
      startTime: {
        second: op.startTime.second,
        minute: op.startTime.minute,
        hour: op.startTime.hour,
        week: [],
      },
      endTime: {
        second: op.endTime.second,
        minute: op.endTime.minute,
        hour: op.endTime.hour,
        week: [],
      },
    },
  });
};
chatManagerSchema.methods.updateByJoiningChatRoom = function (
  clientName,
  roomName
) {
  return this.updateOne({
    $push: {
      JoiningChatRoom: {
        clientName,
        roomName,
      },
    },
  });
};

chatManagerSchema.methods.updateByManager = function (chatState) {
  return this.updateOne({
    managerId: chatState.managerId,
    clientId: chatState.clientId,
    nameSpace: chatState.nameSpace,
    chatState: chatState.chatState,
  });
};

const ManagerChat = mongoose.model("managerChat", chatManagerSchema);
export default ManagerChat;
