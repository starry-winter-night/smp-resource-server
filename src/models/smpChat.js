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
      stayRoomOwnerId: String,
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
          userType: String,
          message: String,
          image: String,
          registerTime: String,
          roomName: String,
          observe: Boolean,
        },
      ],
    },
  ],
});

smpChatSchema.statics.findByClientId = function (clientId) {
  return this.findOne(
    { clientId },
    { chatApiKey: false, "client.chatLog._id": false }
  );
};

smpChatSchema.statics.findByChatApiKey = function (chatApiKey) {
  return this.findOne({ chatApiKey }, { clientId: true, chatApiKey: true });
};

smpChatSchema.statics.findByUserId = function (clientId, userId, type) {
  if (type === "manager") {
    return this.findOne(
      { clientId, "manager.managerId": userId },
      { "manager.managerId": true }
    );
  }

  if (type === "client") {
    return this.findOne(
      { clientId, "client.userId": userId },
      { "client.userId": true }
    );
  }
};

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

smpChatSchema.statics.updateByStayRoomOwnerId = function (
  _id,
  clientId,
  managerId
) {
  return this.updateOne(
    { _id, "manager.managerId": managerId },
    { "manager.$.stayRoomOwnerId": clientId }
  );
};

smpChatSchema.statics.updateByObserve = function (_id, clientName, observe) {
  return this.updateOne(
    { _id, "client.userId": clientName, "client.chatLog.userId": clientName },
    { "client.$.chatLog.$[].observe": observe }
  );
};

smpChatSchema.statics.updateByRoomMember = function (
  _id,
  clientId,
  managerId,
  action
) {
  const userId = !managerId ? clientId : managerId;

  if (action === "Delete") {
    return this.updateOne(
      { _id, "client.userId": clientId },
      { $pull: { "client.$.roomMember": userId } }
    );
  }
  if (action === "Add") {
    return this.updateOne(
      { _id, "client.userId": clientId },
      { $addToSet: { "client.$.roomMember": userId } }
    );
  }
};

smpChatSchema.statics.updateByMessage = function (_id, clientName, chatLog) {
  return this.findOneAndUpdate(
    { _id, "client.userId": clientName },
    { $addToSet: { "client.$.chatLog": chatLog } },
    { returnOriginal: false }
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
