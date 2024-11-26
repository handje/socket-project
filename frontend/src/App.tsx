import { useEffect, useState } from "react";
import { connect, io, Socket } from "socket.io-client";

const App = () => {
  //socket객체 상태 관리(연결 관리)
  const [socket, setSocket] = useState<Socket | null>(null);
  //서버 연결 관리
  const [connected, setConnected] = useState(false);

  //닉네임, 룸 관리
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState("");

  //==함수==

  //서버와 socket.io 연결 설정
  const connectToServer = () => {
    if (!socket) {
      const newSocket = io("http://localhost:3000");
      setSocket(newSocket);
      setConnected(true);
    }
  };

  //닉네임 설정
  const handleSetNickname = () => {
    if (socket && nickname.trim()) {
      socket.emit("set_nickname", nickname);
    }
  };
  //닉네임 설정 결과 리스닝
  useEffect(() => {
    if (socket) {
      socket.on("nickname_set", (nickname) => {
        console.log(`Nickname set successfully: ${nickname}`);
      });
      return () => {
        socket.off("nickname_set");
      };
    }
  }, [socket]);

  return (
    <>
      <h1>Socket Chat</h1>
      {!connected && (
        <button onClick={connectToServer}>Connect to Server</button>
      )}
      {connected && (
        <>
          <div>
            <input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button onClick={handleSetNickname}>Set Nickname</button>
          </div>
        </>
      )}
    </>
  );
};

export default App;
