import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChatRoom from "../../components/chat/ChatRoom.jsx";
import { toast } from "react-hot-toast";

const ChatPage = () => {
  const { userId } = useParams();
  const [conversationId, setConversationId] = useState(null);

  // Fetch current user
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.error) return null;
      return data;
    },
    retry: false,
  });

  // Send message notification mutation
  const { mutate: sendNotification } = useMutation({
    mutationFn: async (message) => {
      const res = await fetch("/api/notifications/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          to: userId,
          conversationId,
        }),
      });
      if (!res.ok) throw new Error("Failed to send notification");
      return res.json();
    },
    onError: (error) => {
      console.error("Notification error:", error);
    },
  });

  // Fetch or create conversation
  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await fetch(
          `/api/conversations/${authUser?._id}/${userId}`
        );
        const data = await res.json();
        setConversationId(data._id);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        toast.error("Failed to load conversation");
      }
    };

    if (authUser?._id && userId) {
      getConversation();
    }
  }, [authUser?._id, userId]);

  if (isLoading) return <p>Loading user information...</p>;
  if (!authUser) return <p>Error loading authenticated user</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Messages</h1>
      {conversationId ? (
        <ChatRoom
          currentUserId={authUser._id}
          otherUserId={userId}
          conversationId={conversationId}
          onSendMessage={sendNotification}
        />
      ) : (
        <p>Loading conversation...</p>
      )}
    </div>
  );
};

export default ChatPage;
