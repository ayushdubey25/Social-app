import { useEffect, useRef, useState } from "react";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import XSvg from "../svgs/X";
import { useNotifications } from "../../hooks/useNotification";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const previousUnreadCount = useRef(0);
  const hasMounted = useRef(false);
  //
  const { unseenCount } = useNotifications();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  /*const { data: notifications } = useQuery({
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
      const currentUnread = data?.filter((n) => !n.read)?.length || 0;

      // Update the unread count state
      setUnreadCount(currentUnread);

      // Only show toast if:
      // 1. The component has mounted
      // 2. There are new unread notifications
      // 3. The count has actually increased (not just changed)
      if (hasMounted.current && currentUnread > previousUnreadCount.current) {
        toast.success("🔔 You have a new Signal Alert!", {
          duration: 5000,
          style: {
            background: "#1e3a8a",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }

      // Update the previous count reference
      previousUnreadCount.current = currentUnread;
      hasMounted.current = true;
    },
  });*/

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
      toast.success("Circuit disconnected successfully");
    },
    onError: () => {
      toast.error("Disconnection failed");
    },
  });

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      {/* Sidebar UI */}
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-blue-800/50 w-20 md:w-full bg-gray-900/80 backdrop-blur-sm">
        {/* Logo */}
        <Link
          to="/"
          className="flex justify-center md:justify-start p-4 group relative overflow-hidden"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <XSvg className="w-full h-full text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
          </div>
          <span className="hidden md:block text-xl font-bold text-blue-400 ml-2">
            CIRCUIT
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2 mt-8 px-2">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-blue-900/30 transition-all rounded-full duration-300 p-3 md:pl-4 md:pr-6 max-w-fit cursor-pointer group relative"
            >
              <MdHomeFilled className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              <span className="text-lg hidden md:block text-blue-200 group-hover:text-blue-100">
                Junction
              </span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-blue-900/30 transition-all rounded-full duration-300 p-3 md:pl-4 md:pr-6 max-w-fit cursor-pointer group relative"
            >
              <div className="relative">
                <IoNotifications className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                {unseenCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] px-[4px] rounded-full flex items-center justify-center border-2 border-gray-900 font-semibold">
                    {unseenCount > 9 ? "9+" : unseenCount}
                  </span>
                )}
              </div>
              <span className="text-lg hidden md:block text-blue-200 group-hover:text-blue-100">
                Signal Alerts
              </span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-blue-900/30 transition-all rounded-full duration-300 p-3 md:pl-4 md:pr-6 max-w-fit cursor-pointer group relative"
            >
              <FaUser className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              <span className="text-lg hidden md:block text-blue-200 group-hover:text-blue-100">
                Your Circuit
              </span>
            </Link>
          </li>
        </ul>

        {/* Profile Section */}
        {authUser && (
          <div className="mt-auto mb-4 mx-2">
            <div className="flex gap-2 items-center transition-all duration-300 hover:bg-blue-900/30 py-2 px-3 rounded-full group cursor-pointer relative">
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full border-2 border-blue-500/50 group-hover:border-blue-400/70 transition-colors duration-300">
                  <img
                    src={authUser?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex justify-between flex-1 items-center">
                <div className="hidden md:block">
                  <p className="text-blue-100 font-bold text-sm w-20 truncate">
                    {authUser?.fullname}
                  </p>
                  <p className="text-blue-400/70 text-sm">
                    @{authUser?.username}
                  </p>
                </div>
                <div className="p-2 rounded-full hover:bg-blue-800/30 transition-colors duration-300">
                  <BiLogOut
                    className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
