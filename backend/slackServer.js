//https://github.com/devh-e/socket-programming-using-react/tree/master/part2/slack/server

//1. 로직 및 라이브러리
const privateMsg = require("./privateMsg"); //1:1채팅
const groupMsg = require("./groupMsg"); //그룹채팅
const common = require("./common"); //공통

const mongoose = require("mongoose"); //mongoDB 연결

//2. mongoDB 연결 설정, 환경변수로 대체 필요
const uri =
  "mongodb+srv://slack:1111@cluster0.g4q1ntc.mongodb.net/?retryWrites=true&w=majority";
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

//3. socket.io로 소켓 생성_http or express서버 없이 자체 HTTP서버를 생성하여 연결 처리 , REST API가 필요하지 않은 경우 적합
const io = require("socket.io")(5000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//4. socket.io객체를 받아서 로직 실행
common.commoninit(io);
groupMsg.groupMsginit(io);
privateMsg.privateMsginit(io);
