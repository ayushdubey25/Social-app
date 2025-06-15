import { useEffect, useState } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_SERVER_URL = "http://localhost:5000"; // adjust if deployed

const ChatRoom = ({ currentUserId, otherUserId, conversationId }) => {
  const [socket, setSocket] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (conversationId) {
      setRoomId(conversationId);
    } else {
      const room = [currentUserId, otherUserId].sort().join("_");
      setRoomId(room);
    }
  }, [currentUserId, otherUserId, conversationId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const res = await fetch(`/api/messages/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setChat(data);
        } else {
          console.error("Failed to fetch messages:", await res.text());
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    if (roomId) {
      newSocket.emit("joinRoom", roomId);
    }

    newSocket.on("receiveMessage", (data) => {
      const senderId =
        data.sender && data.sender._id
          ? data.sender._id.toString()
          : data.sender;

      setChat((prev) => [
        ...prev,
        {
          content: data.message,
          sender: senderId,
          timestamp: data.timestamp,
        },
      ]);

      // 🔍 Confirm handler is firing
      console.log("📨 Received new message:", data);

      // ✅ Only show popup if it's from the other user
      if (senderId !== currentUserId) {
        const senderName =
          typeof data.sender === "object" && data.sender.username
            ? data.sender.username
            : "Someone";

        toast.success(`📩 New message from ${senderName}`, {
          duration: 3000,
        });

        notificationSound.play().catch((err) => {
          console.warn("🔇 Could not play sound:", err);
        });
      }
    });

    return () => newSocket.disconnect();
  }, [roomId, currentUserId]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    socket.emit("sendMessage", {
      roomId,
      message,
      sender: currentUserId,
    });

    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: roomId,
          senderId: currentUserId,
          content: message,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }

    setChat((prev) => [
      ...prev,
      { content: message, sender: currentUserId, timestamp: Date.now() },
    ]);
    setMessage("");
  };

  return (
    <div className="chat-room p-4 border rounded w-full max-w-4xl mx-auto">
      <h2 className="mb-4 text-xl font-bold">Chat Room</h2>
      <div className="chat-log h-96 overflow-y-auto border p-2 mb-4">
        {chat.map((msg, index) => {
          const senderId =
            msg.sender && msg.sender._id
              ? msg.sender._id.toString()
              : msg.sender;
          const isMyMessage = senderId === currentUserId;

          return (
            <div
              key={index}
              className={`mb-2 flex ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`inline-block p-2 rounded ${
                  isMyMessage
                    ? "bg-blue-800 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {msg.content}
              </span>
            </div>
          );
        })}
      </div>
      <div className="chat-input flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
