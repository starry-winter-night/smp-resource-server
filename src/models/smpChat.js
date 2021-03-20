import mongoose from "../config/db";
const { Schema } = mongoose;

const smpChatSchema = new Schema({
  clientId: String,
  chatApiKey: String,
  nameSpace: String,
  serverState: String,
  manager: {
    managerIds: [],
    chatRoomHistory: [
      {
        managerId: String,
        clientName: String,
        roomName: String,
      },
    ],
  },
  client: {
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
});

smpChatSchema.statics.findByClientId = function (clientId) {
  return this.findOne({ clientId });
};

smpChatSchema.statics.findByUsername = function (username) {
  return this.findOne({ "manager.managerIds": username });
};

smpChatSchema.statics.findByChatApiKey = function (chatApiKey) {
  return this.findOne({ chatApiKey });
};

smpChatSchema.methods.updateByManagerIds = function (managerId) {
  return this.updateOne({
    $push: {
      "manager.managerIds": managerId,
    },
  });
};

smpChatSchema.methods.updateByServerState = function (serverState) {
  return this.updateOne({ serverState });
};

const SmpChat = mongoose.model("smpChat", smpChatSchema);
export default SmpChat;
