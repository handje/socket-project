// 1. 3개의 스키마, 그룹채팅사용자/그룹메시지/그룹방
const { GroupUserList, GroupRoom, GroupMsg } = require("./schema/Group");

const groupMsg = (io) => {
  // 2. 사용자 아이디 소켓 등록
  io.of("/group").use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    await createGroupUser(userId, socket.id); //해당 사용자를 그룹채팅을 사용하는 사용자에 초기화
    next();
  });

  // 3. 접속한 그룹방이 있는지 조회 (find)
  io.of("/group").on("connection", async (socket) => {
    const groupRoom = await GroupRoom.find({
      loginUserId: socket.userId,
    }).exec();
    socket.emit("group-list", groupRoom); //클라이언트에게 그룹방 리스트를 전송
    // 4. 그룹방에 처음 입장할 때 과거 대화 내역 불러오기
    socket.on("msgInit", async (res) => {
      const { targetId } = res;
      let roomName = null;
      roomName = targetId.join(",");
      const groupMsg = await GroupMsg.find({
        roomNumber: roomName,
      }).exec();
      io.of("/group")
        .to(roomName)
        .emit("group-msg-init", { msg: groupMsg || [] }); //해당 방에 속해 있는 모두에게 이벤트를 전송
    });
    // 5. 참여한 모든 사용자에게 초대 메시지를 전송
    socket.on("reqGroupJoinRoom", async (res) => {
      const { socketId } = res;
      const groupUser = await GroupUserList.find()
        .where("userId")
        .in(socketId.split(",")); //속한 모든 사람의 데이터를 가져옴
      groupUser.forEach((v) => {
        io.of("/group").to(v.socketId).emit("group-chat-req", {
          roomNumber: socketId,
          socketId: v.socketId,
          userId: socket.userId,
        }); //순회하며 초대장 발송
      });
    });
    // 6. 그룹메시지를 전송하고 저장
    socket.on("groupMsg", async (res) => {
      const { msg, toUserSocketId, toUserId, fromUserId, time } = res;
      socket.broadcast.in(toUserSocketId).emit("group-msg", {
        msg: msg,
        toUserId,
        fromUserId,
        toUserSocketId: toUserSocketId,
        time: time,
      });
      await createMsgDocument(toUserSocketId, res);
    });
    // 7. 사용자가 다시 그룹방으로 들어왔을 때 호출
    socket.on("joinGroupRoom", (res) => {
      const { roomNumber } = res;
      socket.join(roomNumber);
    });
    // 8. 방에 초대받은 사용자가 방에 들어가기
    socket.on("resGroupJoinRoom", async (res) => {
      const { roomNumber, socketId } = res;
      socket.join(roomNumber); //방 입장
      await createGroupRoom(socket.userId, roomNumber, roomNumber); //개인이 참가한 방을 생성, 개인마다 참여하는 방이 다르기 때문에 필요

      const groupRoom = await GroupRoom.find({
        loginUserId: socket.userId,
      }).exec();
      io.of("/group").to(socketId).emit("group-list", groupRoom); //사용자 아이디를 검색하여 그 사용자가 가지고 있는 그룹방을 모두 클라이언트로 전송
    });
  });
};

// 9. 개인별로 방을 생성
async function createGroupRoom(loginUserId, userId, socketId) {
  if (loginUserId == null) return;

  return await GroupRoom.create({
    loginUserId: loginUserId,
    status: true,
    userId: userId,
    socketId: socketId,
    type: "group",
  });
}
// 10. 그룹방에 속하기 위한 아이디를 mongoDB에 저장
async function createGroupUser(userId, socketId) {
  if (userId == null) return;
  const document = await GroupUserList.findOneAndUpdate(
    { userId: userId },
    { socketId: socketId }
  );
  if (document) return document;

  return await GroupUserList.create({
    status: true,
    userId: userId,
    socketId: socketId,
  });
}
// 11. 그룹 메시지를 저장
async function createMsgDocument(roomNumber, res) {
  if (roomNumber == null) return;

  return await GroupMsg.create({
    roomNumber: roomNumber,
    msg: res.msg,
    toUserId: res.toUserId,
    fromUserId: res.fromUserId,
    time: res.time,
  });
}

module.exports.groupMsginit = groupMsg;
