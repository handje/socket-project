import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatRoom from "./ChatRoom";

const ChatMain = () => {
  //socket객체 상태 관리(연결 관리)
  const [socket, setSocket] = useState<Socket | null>(null);
  //서버 연결 관리
  const [connected, setConnected] = useState(false);

  //닉네임, 룸 관리
  const nameInput = useRef<HTMLInputElement>(null);
  const roomInput = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    nameInput.current?.focus();
    roomInput.current?.focus();
  }, [connected, nickname, room]);

  //서버와 socket.io 연결 설정
  const connectToServer = () => {
    if (!socket) {
      const newSocket = io("http://localhost:3000");
      newSocket.on("connect", () => {
        console.log("connected");
        setSocket(newSocket);
        setConnected(true);
      });
    }
  };
  const disconnectToServer = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setNickname("");
      setRoom("");
    }
  };

  //닉네임 설정
  const handleSetNickname = () => {
    const name = nameInput.current?.value.trim();
    if (socket && name) {
      socket.emit("set_nickname", name);
      setNickname(name);
    }
  };

  //room입장 요청
  const handleJoinRoom = () => {
    const room = roomInput.current?.value.trim();
    if (socket && room) {
      socket.emit("join_room", room);
      setRoom(room);
    }
  };

  //닉네임 설정 & 방 입장 결과 리스닝
  useEffect(() => {
    if (socket) {
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
      {!connected ? (
        <button id="connectBtn" onClick={connectToServer}>
          Connect
        </button>
      ) : (
        <button id="connectBtn" onClick={disconnectToServer}>
          Disconnect
        </button>
      )}
      {nickname && <h2>{`Welcome,${nickname}`}</h2>}
      {connected && (
        <div className="box">
          {!nickname && (
            <div className="flex">
              <form className="inputBox">
                <input placeholder="Enter your nickname" ref={nameInput} />
                <button type="submit" onClick={handleSetNickname}>
                  OK
                </button>
              </form>
            </div>
          )}
          {nickname && !room && (
            <div className="flex">
              <form className="inputBox">
                <input placeholder="Enter room name" ref={roomInput} />
                <button type="submit" onClick={handleJoinRoom}>
                  Join
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      {nickname && room && socket && (
        <>
          <ChatRoom
            socket={socket}
            room={room}
            nickname={nickname}
            setRoom={setRoom}
          />
        </>
      )}
    </>
  );
};

export default ChatMain;
