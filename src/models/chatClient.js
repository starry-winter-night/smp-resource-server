import mongoose from "../config/db";
const { Schema } = mongoose;

const chatClientSchema = new Schema(
  {
    room: {
      roomName: String,
      userName: String,
      nickName: String,
      status: String,
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
  },
  {
    timestamps: { currentTime: () => Date.now() + 3600000 * 9 },
  }
);

chatClientSchema.statics.findBySocketId = function (client) {
  return this.findOne({ "room.socketId": client });
};
chatClientSchema.statics.findByChatLog = function (username, DialogNum) {
  return this.findOne({
    "room.username": username,
    "room.chatLog": { $elemMatch: { seq: DialogNum } },
  });
};
chatClientSchema.statics.findByMember = function () {
  return this.find({
    "room.currentMember": { $exists: true, $ne: [] },
  });
};
chatClientSchema.statics.findByStatusChatting = function () {
  return this.find({
    "room.status": "chatting",
  });
};
chatClientSchema.statics.findByUsername = function (username) {
  return this.findOne({ "room.userName": username });
};

chatClientSchema.statics.findByRecentLog = function () {
  return this.find({ "room.chatLog.user": "test2" });
}; //sort({ "room.chatLog._id": 1 })
chatClientSchema.methods.updateByStatus = function (status) {
  return this.updateOne({
    "room.status": status,
  });
};

chatClientSchema.methods.updateBySocketId = function (socketId) {
  return this.updateOne({
    "room.socketId": socketId,
  });
};

chatClientSchema.methods.updateByChatLog = function (time, seq, message, user) {
  return this.updateOne({
    $push: {
      "room.chatLog": {
        seq: seq + 1,
        user,
        message,
        simpleTime: time.messageViewTime,
        currentTime: time.currentTime,
      },
    },
  });
};

chatClientSchema.methods.updateByChatMember = function (member, action) {
  if (action) {
    return this.updateOne({ $push: { "room.currentMember": member } });
  }
  if (!action) {
    return this.updateOne({ $pull: { "room.currentMember": member } });
  }
};

const ClientChat = mongoose.model("clinetChat", chatClientSchema);
export default ClientChat;
