import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner.jsx";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Signal transmission failed");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) {
    return <div className="md:w-64 w-0"></div>;
  }

  return (
    <div className="hidden lg:block my-4 mx-2 min-w-[280px]">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-blue-800/30 p-4 rounded-xl sticky top-2 transition-all duration-300 hover:border-blue-500/50">
        {/* Header with circuit-inspired design */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="font-bold text-blue-300">Suggested Nodes</p>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent ml-2"></div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4 p-2 rounded-lg transition-all duration-300 hover:bg-blue-900/20 group"
                key={user._id}
              >
                <div className="flex gap-3 items-center">
                  <div className="avatar relative">
                    <div className="w-10 rounded-full border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors duration-300">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-blue-100 tracking-tight truncate">
                      {user.fullname}
                    </span>
                    <span className="text-sm text-blue-400/70 truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className={`btn rounded-full btn-sm px-4 transition-all duration-300 ${
                      isPending
                        ? "bg-blue-800 text-blue-300"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Connect
                      </span>
                    )}
                  </button>
                </div>
              </Link>
            ))}
        </div>

        {/* Circuit-inspired footer */}
        <div className="mt-4 pt-3 border-t border-blue-800/30">
          <div className="flex items-center gap-2 text-xs text-blue-400/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Expand your network</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
