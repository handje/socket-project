//1. User테이블의 스키마 내용 불러오기
const User = require("./schema/User");

const common = (io) => {
  //2. 미들웨어를 이용해서 접속한 소켓의 초기 설정
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId; //클라이언트에서 받은 userId를 소켓에 등록
    if (!userId) {
      console.log("err");
      return next(new Error("invalid userId"));
    }
    socket.userId = userId;
    await findOrCreateUser(socket.userId, socket.id); //mongoDB에 사용자를 등록
    next();
  });

  //3. 소켓이 연결되면 mongoDB에 등록되어 있는 사용자 리스트를 클라이언트에 전송
  io.on("connection", async (socket) => {
    io.sockets.emit("user-list", await User.find()); //mongoose 메서드, 등록된 모든 데이터 불러오기

    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ _id: socket.userId }, { status: false }); //접속상태 변경
      io.sockets.emit("user-list", await User.find());
      console.log("disconnect...");
    });
  });
};

//4. 사용자 등록
async function findOrCreateUser(userId, socketId) {
  if (userId === null) return;

  const document = await User.findOneAndUpdate(
    { _id: userId },
    { status: true }
  );
  if (document) return document;
  return await User.create({
    _id: userId,
    status: true,
    userId: userId,
    socketId: socketId,
  });
}

module.exports.commoninit = common;
