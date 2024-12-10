//사용자 리스트 정의

const { Schema, model } = require("monoose");

const user = new Schema({
  _id: String,
  status: Boolean, // 사용자가 현재 접속했는지
  userId: String,
  socketId: String, //소켓의 현재 연결 값
});

module.exports = model("User", user);
