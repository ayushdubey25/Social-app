// hooks/useNotifications.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [unseenCount, setUnseenCount] = useState(0);
  const previousUnseenCount = useRef(0);
  const hasMounted = useRef(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch notifications");
      return data;
    },
    refetchInterval: 3000,
    onSuccess: (data) => {
      const currentUnseen = data?.filter((n) => !n.read)?.length || 0;
      setUnseenCount(currentUnseen);

      // Show toast only for new unseen notifications
      if (hasMounted.current && currentUnseen > previousUnseenCount.current) {
        toast.success(
          `🔔 You have ${
            currentUnseen - previousUnseenCount.current
          } new Signal Alerts!`,
          {
            duration: 5000,
            style: {
              background: "#1e3a8a",
              color: "#fff",
              fontWeight: "bold",
            },
          }
        );
      }

      previousUnseenCount.current = currentUnseen;
      hasMounted.current = true;
    },
  });

  const markAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      queryClient.invalidateQueries(["notifications"]);
      setUnseenCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return {
    notifications,
    unseenCount,
    markAsRead,
    isLoading,
    totalCount: notifications?.length || 0,
  };
};
