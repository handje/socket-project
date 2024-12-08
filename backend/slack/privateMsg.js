const { PrivateRoom, PrivateMsg } = require("./schema/Private");

const privateMsg = (io) => {
  //2.미들웨어로 접속간 사용자 아이디 등록
  io.of("/private").use((socket, next) => {
    const userId = socket.handshake.auth.userId; //클라이언트에서 받은 userId를 소켓에 등록
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    next();
  });

  io.of("/private").on("connection", (socket) => {
    //3. private 채팅방에 들어가면 실행되는 이벤트(msgInit) , 과거 채팅 이력 가져오기
    socket.on("msgInit", async (res) => {
      const { targetId } = res;
      const userId = targetId[0];

      const privateRoom = await getRoomNumber(userId, socket.userId); //클라이언트에서 보낸 userId와 소켓에 등록된 사용자 아이디를 이용햇 기존 private방을 검색
      if (!privateRoom) return;
      const msgList = await PrivateMsg.find({
        roomNumber: privateRoom._id,
      }).exec(); //기존방이 있다면 대화 내역 가져오기

      io.of("/private")
        .to(privateRoom._id)
        .emit("private-msg-init", { msg: msgList }); //이벤트로 클라이언트에 전송
    });

    //4. private메시지 전송 이벤트
    socket.on("privateMsg", async (res) => {
      const { msg, toUserId, time } = res;
      const privateRoom = await getRoomNumber(toUserId, socket.userId); //방 검색
      if (!privateRoom) return;

      socket.broadcast.in(privateRoom._id).emit("private-msg", {
        msg: msg,
        toUserId: toUserId,
        fromUserId: socket.userId,
        time: time,
      }); //broadcast.in()으로 해당 방에 있는 사용자에게 메시지 전송

      await createMsgDocument(privateRoom._id, res); //mongoDB에 메시지 저장
    });

    //5. private방에 초대 및 참여
    socket.on("reqJoinRoom", async (res) => {
      const { targetId, targetSocketId } = res;
      let privateRoom = await getRoomNumber(targetId, socket.userId);
      if (!privateRoom) {
        privateRoom = `${targetId}-${socket.userId}`;
        await findOrCreateRoomDocument(privateRoom); //방이 없다면 생성
      } else {
        privateRoom = privateRoom._id;
      }
      socket.join(privateRoom); //방에 참여

      io.of("/private")
        .to(targetSocketId)
        .emit("msg-alert", { roomNumber: privateRoom }); //방번호와 함께 초대장 전송
    });

    //6. 초대받은 사용자에게 자동으로 호출 (자동으로 입장)
    socket.on("resJoinRoom", (res) => {
      socket.join(res);
    });
  });
};

//7. mongoDB에 등록된 방 검색_중복방지로 두번 검색
async function getRoomNumber(fromId, toId) {
  return (
    (await PrivateRoom.findById(`${fromId}-${toId}`)) ||
    (await PrivateRoom.findById(`${toId}-${fromId}`))
  );
}

//8. 방 생성 및 반환
async function findOrCreateRoomDocument(room) {
  if (room === null) return;

  const document = await PrivateRoom.findById(room);
  if (document) return document; //기존 방 반환

  return await PrivateRoom.create({ _id: room });
}

//9. 메시지 생성
async function createMsgDocument(roomNumber, res) {
  if (roomNumber === null) return;

  return await PrivateMsg.create({
    roomNumber: roomNumber,
    msg: res.msg,
    toUserId: res.toUserId,
    fromUserId: res.fromUserId,
    time: res.time,
  });
}

module.exports.privateMsginit = privateMsg;
