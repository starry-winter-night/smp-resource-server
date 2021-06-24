import mongoose from "../config/db.js";
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    username: String,
    hashedPassword: String,
    email: String,
    name: String,
    agree: Boolean,
    client: {
      clientId: String,
      clientSecret: String,
      chatApiKey: String,
    },
  },
  {
    timestamps: { currentTime: () => Date.now() + 3600000 * 9 },
  }
);

memberSchema.statics.findByUsername = function (username) {
  return this.findOne({ username }, { hashedPassword: false });
};
memberSchema.statics.findById = function (id) {
  return this.findOne({ _id: id }, { hashedPassword: false });
};

memberSchema.statics.findByClientId = function (clientId) {
  return this.findOne(
    { "client.clientId": clientId },
    { hashedPassword: false, "client.clientSecret": false }
  );
};
memberSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.client.clientSecret;
  delete data.hashedPassword;
  return data;
};

export default mongoose.model("member", memberSchema);
