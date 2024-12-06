import { useEffect, useState } from "react";
import { connect, io, Socket } from "socket.io-client";
import ChatRoom from "./ChatRoom";

const ChatMain = () => {
  //socket객체 상태 관리(연결 관리)
  const [socket, setSocket] = useState<Socket | null>(null);
  //서버 연결 관리
  const [connected, setConnected] = useState(false);

  //닉네임, 룸 관리
  const [nickname, setNickname] = useState("");
  const [hasName, setHasName] = useState(false);
  const [room, setRoom] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);

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
      setHasName(true);
    }
  };

  //room입장 요청
  const handleJoinRoom = () => {
    if (socket && room.trim()) {
      socket.emit("join_room", room);
      setIsInRoom(true);
    }
  };

  //닉네임 설정 & 방 입장 결과 리스닝
  useEffect(() => {
    if (socket) {
      console.log("useEffect");
      socket.on("nickname_set", (nickname) => {
        console.log(`Nickname set successfully: ${nickname}`);
      });
      socket.on("room_join", (room) => {
        console.log(`Room ${room} join successfully`);
      });
      return () => {
        socket.off("nickname_set");
        socket.off("room_join");
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
          {!hasName && (
            <div>
              <input
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button onClick={handleSetNickname}>Set Nickname</button>
            </div>
          )}
          {hasName && (
            <div>
              <h2>Welcome,{nickname}</h2>
              <input
                placeholder="Enter room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
              <button onClick={handleJoinRoom}>Join Room</button>
            </div>
          )}
        </>
      )}
      {hasName && isInRoom && socket && (
        <ChatRoom socket={socket} room={room} nickname={nickname} />
      )}
    </>
  );
};

export default ChatMain;
