import React, { useState } from "react";

import { useSocket, useSocketEmit, useSocketEvent } from "./hooks";

const Home: React.FC = () => {
  const [nickname, setNickname] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const { socket } = useSocket("http://localhost:3000"); // 소켓 연결 커스텀 훅
  const emit = useSocketEmit(socket); // 이벤트 전송 커스텀 훅

  // 닉네임 설정 완료 메시지 처리
  useSocketEvent(socket, "nickname_set", (nickname: string) => {
    console.log(`Nickname set successfully: ${nickname}`);
  });

  // 방 메시지 수신 처리
  useSocketEvent(socket, "room_message", (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  });

  // 닉네임 설정 함수
  const handleSetNickname = () => {
    if (nickname.trim()) {
      emit("set_nickname", nickname); // "set_nickname" 이벤트 전송
    }
  };

  // 방 입장 함수
  const handleJoinRoom = () => {
    if (room.trim()) {
      emit("join_room", room); // "join_room" 이벤트 전송
    }
  };

  // 메시지 목록 렌더링
  return (
    <div>
      <h1>React Socket.IO Chat</h1>
      <div>
        <input
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button onClick={handleSetNickname}>Set Nickname</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
