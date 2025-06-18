import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    const BASE = import.meta.env.VITE_BACKEND_URL;

    switch (feedType) {
      case "forYou":
        return {
          url: `${BASE}/api/posts/all`,
          options: { credentials: "include" },
        };
      case "following":
        return {
          url: `${BASE}/api/posts/following`,
          options: { credentials: "include" },
        };
      case "posts":
        return {
          url: `${BASE}/api/posts/user/${username}`,
          options: { credentials: "include" },
        };
      case "likes":
        return {
          url: `${BASE}/api/posts/likes/${userId}`,
          options: { credentials: "include" },
        };
      default:
        return {
          url: `${BASE}/api/posts/all`,
          options: { credentials: "include" },
        };
    }
  };

  const { url, options } = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts", feedType, username],
    queryFn: async () => {
      try {
        const res = await fetch(url, options);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message || "Fetch failed");
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
