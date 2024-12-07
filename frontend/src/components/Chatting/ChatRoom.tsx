import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const ChatRoom = ({
  socket,
  room,
  nickname,
}: {
  socket: Socket;
  room: string;
  nickname: string;
}) => {
  //채팅 관리
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");

  //개인메시지 관리
  const [privateInput, setPrivateInput] = useState<string>("");
  const [privateTo, setPrivateTo] = useState<string>("");

  //채팅 수신
  useEffect(() => {
    socket.on("room_message", (message: string) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on(
      "private_message",
      ({ from, message }: { from: string; message: string }) => {
        setMessages((prev) => [...prev, `Private from ${from}: ${message}`]);
      }
    );

    return () => {
      socket.off("room_message");
      socket.off("private_message");
    };
  }, [socket]);

  //채팅 보내기
  const sendRoomMessage = () => {
    if (input.trim()) {
      socket.emit("room_message", input);
      setInput("");
    }
  };

  //개인채팅
  const sendPrivateMessage = () => {
    if (privateInput.trim() && privateTo.trim()) {
      socket.emit("private_message", { to: privateTo, message: privateInput });
      setPrivateInput("");
    }
  };
  return (
    <div id="chattingBox" className="container">
      <h1>Room : {room}</h1>
      <div id="messageBox">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div className="inputBox">
        <input
          id="msg"
          placeholder="Room message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendRoomMessage}>Send</button>
      </div>
      <div id="private" className="inputBox">
        <input
          id="privateId"
          placeholder="Recipient ID"
          value={privateTo}
          onChange={(e) => setPrivateTo(e.target.value)}
        />
        <input
          id="privateMsg"
          placeholder="Private message"
          value={privateInput}
          onChange={(e) => setPrivateInput(e.target.value)}
        />
        <button onClick={sendPrivateMessage}>Send</button>
      </div>
    </div>
  );
};
export default ChatRoom;
