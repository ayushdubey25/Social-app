import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useNotifications } from "../../hooks/useNotification";
const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { notifications, unreadCount, markAsRead, isLoading } =
    useNotifications();

  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead();
    }
  }, [markAsRead, unreadCount]);

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notifications cleared successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark notifications as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await fetch("/api/notifications/read", {
          method: "PUT",
        });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        setUnreadCount(0); // Reset count after marking as read
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    if (unreadCount > 0) {
      markAsRead();
    }
  }, [queryClient, unreadCount]);

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <IoNotificationsOutline className="w-5 h-5" />
            <p className="font-bold">Notifications</p>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications</div>
        )}
        {notifications?.map((notification) => (
          <div
            className={`border-b border-gray-700 ${
              !notification.read ? "bg-blue-50/10" : ""
            }`}
            key={notification._id}
          >
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              {notification.type === "available" && (
                <div className="w-7 h-7 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {notification.type === "message" && (
                <div className="w-7 h-7 text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
              )}
              <Link
                to={
                  notification.type === "message"
                    ? `/chat/${notification.from._id}`
                    : `/profile/${notification.from.username}`
                }
              >
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                      alt={notification.from.username}
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "followed you"
                    : notification.type === "like"
                    ? "liked your post"
                    : notification.type === "available"
                    ? "is now available"
                    : "sent you a message"}
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
