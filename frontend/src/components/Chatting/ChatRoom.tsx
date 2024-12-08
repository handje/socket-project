import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

const ChatRoom = ({
  socket,
  room,
  nickname,
  setRoom,
}: {
  socket: Socket;
  room: string;
  nickname: string;
  setRoom: (room: string) => void;
}) => {
  //채팅 관리
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const msgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    msgRef.current?.focus();
  }, []);

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
        setMessages((prev) => [...prev, `Private from ${from} : ${message}`]);
      }
    );

    return () => {
      socket.off("room_message");
      socket.off("private_message");
    };
  }, [socket]);

  //채팅 보내기
  const sendRoomMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (msgRef.current) {
      socket.emit("room_message", msgRef.current.value.trim());
      msgRef.current.value = "";
    }
  };

  //개인채팅
  const sendPrivateMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (privateInput.trim() && privateTo.trim()) {
      socket.emit("private_message", { to: privateTo, message: privateInput });
      setMessages((prev) => [...prev, `me->${privateTo} : ${privateInput}`]);
      setPrivateInput("");
    }
  };

  return (
    <div id="chattingBox" className="container">
      <div id="roomTool" className="flex-row">
        <h1>Room : {room}</h1>
        <button
          onClick={() => {
            socket.emit("exit_room", room);
            setRoom("");
          }}
        >
          Exit Room
        </button>
      </div>
      <div id="messageBox">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <form className="inputBox" onSubmit={sendRoomMessage}>
        <input
          id="msg"
          placeholder="Room message"
          ref={msgRef}
          autoComplete="off"
        />
        <button>Send</button>
      </form>
      <form id="private" className="inputBox" onSubmit={sendPrivateMessage}>
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
        <button>Send</button>
      </form>
    </div>
  );
};
export default ChatRoom;
