const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
//Express 애플리케이션 객체를 생성 -> 서버와 클라이언트간의 HTTP요청 및 응답 처리

const server = http.createServer(app);
//HTTP서버 생성, Express객체를 기반으로 함
//HTTP요청을 처리하고 Socket.io를 사용할 수 있게 함

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
//Socket.io서버 생성, io객체는 클라이언트와 웹소켓 연결 및 양방향 통신 처리
//HTTP서버를 전달하여 socket.io인스턴스 초기화
//CORS에러 방지 옵션 (cors)

const users = {}; //사용자 정보 {socket.id:{nickname,room}}

//클라이언트 연결 이벤트
io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);

  //닉네임 설정
  socket.on("set_nickname", (nickname) => {
    users[socket.id] = { nickname, room: null };
    socket.emit("nickname_set", nickname);
    console.log(`${socket.id} set nickname : ${nickname}`);
  });

  //사용자 연결 해제
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.nickname} disconneted`);
      delete user[socket.id];
    }
  });
});

//Express와 HTTP서버를 실행
//listen(portNum,callback) : 서버가 지정된 포트번호에서 HTTP요청을 대기(수신), 포트에서 연결을 대기 ->서버가 성공적으로 시작되면 콜백함수 실행->해당주소로 들어오는 요청을 대기
server.listen(3000, () => {
  //서버 정상 작동 확인용
  console.log("Server is running on http://localhost:3000");
});