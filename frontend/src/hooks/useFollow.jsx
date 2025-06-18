import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const useFollow = () => {
  const { authUser } = useAuthContext();
  const queryClient = useQueryClient();

  const followUser = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/follow/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to follow user");
      }

      return {
        updatedUser: data.user, // The user being followed/unfollowed
        updatedCurrentUser: data.currentUser, // The auth user making the action
        isFollowing: data.isFollowing, // Whether the user is now following
      };
    } catch (error) {
      console.error("Follow error:", error);
      throw error;
    }
  };

  const { mutate: follow, isPending } = useMutation({
    mutationFn: followUser,
    onSuccess: (result, userId) => {
      if (!result) return;

      // Update the profile being viewed
      queryClient.setQueryData(["userProfile"], (old) => {
        if (!old || !result.updatedUser) return old;
        return {
          ...old,
          follower: result.updatedUser.follower || old.follower || [],
          followerCount:
            result.updatedUser.follower?.length || old.followerCount || 0,
        };
      });

      // Update the current auth user
      queryClient.setQueryData(["authUser"], (old) => {
        if (!old || !result.updatedCurrentUser) return old;
        return {
          ...old,
          following: result.updatedCurrentUser.following || [],
          followingCount:
            result.updatedCurrentUser.following?.length ||
            old.followingCount ||
            0,
        };
      });

      toast.success(
        result.isFollowing ? "Followed successfully" : "Unfollowed successfully"
      );
    },
  });

  return { follow, isPending };
};

export default useFollow;
