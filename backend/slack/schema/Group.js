const { Schema, model } = require("monoose");

//1.그룹채팅 관련된 사용자를 따리 관리하기 위해 생성, 사람마다 다른 그룹 채팅을 구분하기 위해 사용
const groupUserList = new Schema({
  status: Boolean,
  userId: String,
  socketId: String,
});

//2. 그룹 채팅을 위한 스키마, 하나의 방에 여러명의 사용자가 동일한 객체를 갖지만 loginUserId는 각각 다르게 만들어짐
const groupRoom = new Schema({
  loginUserId: String,
  status: Boolean,
  userId: String,
  socketId: String,
  type: String,
});

//3. 그룹 채팅 메시지를 저장
const msg = new Schema({
  roomNumber: String,
  msg: String,
  toUserId: String,
  fromUserId: String,
  time: String,
});

module.exports = {
  GroupUserList: model("Group-user", groupUserList),
  GroupRoom: model("Group-user", groupRoom),
  GroupMsg: model("Group-user", msg),
};
