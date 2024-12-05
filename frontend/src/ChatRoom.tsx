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
    <>
      <h1>ChatRoom {room}</h1>
      <p>My Nickname</p>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Room message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendRoomMessage}>Send to Room</button>
      <hr />
      <input
        type="text"
        placeholder="Recipient ID"
        value={privateTo}
        onChange={(e) => setPrivateTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Private message"
        value={privateInput}
        onChange={(e) => setPrivateInput(e.target.value)}
      />
      <button onClick={sendPrivateMessage}>Send Private</button>
    </>
  );
};
export default ChatRoom;
