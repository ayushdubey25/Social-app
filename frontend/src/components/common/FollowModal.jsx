import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const FollowModal = ({ userId, type, onClose }) => {
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${type}`, userId],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/${type}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) {
          // Handle specific HTTP errors
          if (res.status === 404) {
            throw new Error("User not found");
          }
          throw new Error(`Server responded with ${res.status}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw new Error("Failed to load data. Please try again.");
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-blue-100">
            {type === "follower" ? "Follower" : "Following"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-center py-4 text-red-400">{error.message}</p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                key={user._id}
                onClick={onClose}
                className="flex items-center gap-3 py-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 px-2 rounded transition"
              >
                <img
                  src={user.profileImg || "/avatar-placeholder.png"}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={user.username}
                />
                <div>
                  <p className="font-medium text-blue-100">{user.fullname}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center py-4 text-gray-400">
              No {type === "follower" ? "follower" : "following"} found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
