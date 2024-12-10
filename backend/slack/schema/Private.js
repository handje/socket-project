const { Schema, model } = require("monoose");

// 1:1채팅방 저장
const msg = new Schema({
  roomNumber: String,
  msg: String,
  toUserId: String,
  fronUserId: String,
  time: stirng,
});

//1:1채팅 저장
const room = new Schema({
  _id: String,
});

module.exports = {
  PrivateMsg: model("Private-msg", msg),
  PrivateRoom: model("Private-room", room),
};
