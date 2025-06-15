import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Signal transmitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-blue-800/50 relative z-10 backdrop-blur-sm bg-gray-900/80">
      <div className="avatar">
        <div className="w-10 rounded-full border-2 border-blue-500/50 hover:border-blue-400 transition-all duration-300">
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none bg-transparent text-blue-100 placeholder-blue-400/60"
          placeholder="Transmit your signal..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="3"
        />
        {img && (
          <div className="relative w-full max-w-2xl mx-auto border border-blue-500/30 rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1">
              <IoCloseSharp
                className="text-blue-300 hover:text-blue-100 w-5 h-5 cursor-pointer transition-colors"
                onClick={() => {
                  setImg(null);
                  imgRef.current.value = null;
                }}
              />
            </div>
            <img
              src={img}
              className="w-full mx-auto max-h-80 object-contain rounded bg-gray-800/50"
            />
          </div>
        )}
        <div className="flex justify-between border-t py-3 border-t-blue-800/50">
          <div className="flex gap-4 items-center">
            <div
              className="p-2 rounded-full hover:bg-blue-900/30 transition-all duration-300 cursor-pointer group relative"
              onClick={() => imgRef.current.click()}
            >
              <CiImageOn className="text-blue-400 w-6 h-6 group-hover:text-blue-300 transition-colors" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"></div>
            </div>
            <div className="p-2 rounded-full hover:bg-blue-900/30 transition-all duration-300 cursor-pointer group relative">
              <BsEmojiSmileFill className="text-blue-400 w-5 h-5 group-hover:text-blue-300 transition-colors" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"></div>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button
            className={`btn rounded-full px-6 font-medium text-white ${
              isPending
                ? "bg-blue-900/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            } transition-all duration-300 relative overflow-hidden`}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="relative z-10">Transmitting...</span>
                <span className="absolute inset-0 bg-blue-500/30 animate-pulse"></span>
              </>
            ) : (
              <>
                <span className="relative z-10">Transmit</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </>
            )}
          </button>
        </div>
        {isError && (
          <div className="text-red-400 bg-red-900/30 px-4 py-2 rounded-lg border border-red-800/50">
            Transmission failed: {error.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
