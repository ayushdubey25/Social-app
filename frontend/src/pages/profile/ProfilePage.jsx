import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import FollowModal from "../../components/common/FollowModal";
import { POSTS } from "../../utils/db/dummy";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow.jsx";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile.jsx";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [availability, setAvailability] = useState("Checking...");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("follower");

  const [day, setDay] = useState("monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const { username } = useParams();
  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const [editingTable, setEditingTable] = useState(false);
  const prevFollowersRef = useRef([]);

  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${username}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const [userTimetable, setUserTimetable] = useState(() => ({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }));

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();
  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/timetable/${user?._id}`
        );
        const data = await res.json();

        if (res.ok) {
          const safeTimetable = data.timetable || {};
          setUserTimetable({
            monday:
              safeTimetable.monday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            tuesday:
              safeTimetable.tuesday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            wednesday:
              safeTimetable.wednesday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            thursday:
              safeTimetable.thursday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            friday:
              safeTimetable.friday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            saturday:
              safeTimetable.saturday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
            sunday:
              safeTimetable.sunday?.filter(
                (slot) => slot?.start && slot?.end
              ) || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      }
    };

    fetchTimetable();
  }, [user?._id]);

  // Poll for new followers every 10 seconds

  useEffect(() => {
    if (!isMyProfile || !authUser?._id) return;

    const pollFollowers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/followers/${
            authUser._id
          }`
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const newFollowers = data;
        const prevFollowers = prevFollowersRef.current;

        // Find new followers not in previous list
        const newOnes = newFollowers.filter(
          (f) => !prevFollowers.some((pf) => pf._id === f._id)
        );

        if (newOnes.length > 0) {
          newOnes.forEach((follower) => {
            // ✅ Show toast for each new follower
            toast.success(`🎉 ${follower.username} just followed you!`, {
              duration: 5000,
              style: {
                background: "#1e3a8a",
                color: "#fff",
                fontWeight: "bold",
              },
            });
          });
        }

        // Save current list
        prevFollowersRef.current = newFollowers;
      } catch (err) {
        console.error("Error polling followers:", err);
      }
    };

    // Run once immediately
    pollFollowers();

    // Then poll every 10 seconds
    const interval = setInterval(pollFollowers, 10000);
    return () => clearInterval(interval);
  }, [authUser?._id, isMyProfile]);

  useEffect(() => {
    const checkAvailability = () => {
      try {
        const currentDay = new Date()
          .toLocaleString("en-US", { weekday: "long" })
          .toLowerCase();
        const currentTime = new Date().toTimeString().slice(0, 5);

        const schedule = userTimetable[currentDay] || [];

        const isBusy = schedule.some((slot) => {
          if (!slot || !slot.start || !slot.end) return false;
          return currentTime >= slot.start && currentTime <= slot.end;
        });

        setAvailability(isBusy ? "Unavailable" : "Available");
      } catch (error) {
        console.error("Error checking availability:", error);
        setAvailability("Unknown");
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, [userTimetable]);

  const handleRemove = async (day, index) => {
    if (!isMyProfile || !user?._id) return;

    try {
      const originalTimetable = { ...userTimetable };
      const slotToRemove = originalTimetable[day][index];

      const updatedTimetable = {
        ...originalTimetable,
        [day]: originalTimetable[day].filter((_, i) => i !== index),
      };
      setUserTimetable(updatedTimetable);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/timetable/remove-slot`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            day,
            slot: slotToRemove,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setUserTimetable(originalTimetable);
        throw new Error(data.error || "Failed to permanently remove slot");
      }

      refetch();
    } catch (error) {
      console.error("Persistence error:", error.message);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!startTime || !endTime || !day) {
      console.error("All fields are required");
      return;
    }

    const newTimeSlot = {
      start: startTime.trim(),
      end: endTime.trim(),
    };

    if (
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTimeSlot.start) ||
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTimeSlot.end)
    ) {
      console.error("Invalid time format");
      return;
    }

    try {
      const updatedTimetable = {
        ...userTimetable,
        [day]: [...(userTimetable[day] || []), newTimeSlot],
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/timetable`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            timetable: updatedTimetable,
          }),
        }
      );

      if (res.ok) {
        setUserTimetable(updatedTimetable);
        setStartTime("");
        setEndTime("");
        setEditingTable(false);
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <>
      <div className="flex-[4_4_0] border-r border-blue-800/50 min-h-screen bg-gray-900/80 backdrop-blur-sm relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-0.5 h-full bg-blue-500 animate-pulse"
            style={{ boxShadow: "0 0 10px 2px rgba(59, 130, 246, 0.8)" }}
          ></div>
          <div
            className="absolute top-1/3 left-0 w-full h-0.5 bg-blue-500 animate-pulse delay-300"
            style={{ boxShadow: "0 0 10px 2px rgba(59, 130, 246, 0.8)" }}
          ></div>
          <div
            className="absolute top-2/3 right-0 w-20 h-0.5 bg-blue-500 animate-pulse delay-500"
            style={{ boxShadow: "0 0 10px 2px rgba(59, 130, 246, 0.8)" }}
          ></div>
          <div
            className="absolute bottom-10 left-1/3 w-0.5 h-20 bg-blue-500 animate-pulse delay-700"
            style={{ boxShadow: "0 0 10px 2px rgba(59, 130, 246, 0.8)" }}
          ></div>
        </div>

        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4 text-blue-300">
            User not found
          </p>
        )}

        <div className="flex flex-col relative z-10">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link
                  to="/"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg text-blue-100">
                    {user?.fullname}
                  </p>
                  <span className="text-sm text-blue-400/80">
                    {POSTS?.length} posts
                  </span>
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800/80 backdrop-blur-sm cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-blue-300" />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />

                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar border-2 border-blue-500/50 hover:border-blue-400 transition-all duration-300">
                    <img
                      src={
                        profileImg ||
                        user?.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                    <div className="absolute top-5 right-3 p-1 bg-blue-600 rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer transition-all duration-300">
                      {isMyProfile && (
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <button
                    className="btn rounded-full btn-sm border border-blue-500 text-blue-300 hover:bg-blue-900/30 hover:border-blue-400 px-4 transition-all duration-300"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending && "Loading..."}
                    {!isPending && amIFollowing && "Unfollow"}
                    {!isPending && !amIFollowing && "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <button
                    className="btn rounded-full btn-sm bg-blue-600 hover:bg-blue-500 text-white px-4 ml-2 transition-all duration-300"
                    onClick={() => {
                      updateProfile({ coverImg, profileImg });
                    }}
                  >
                    {isUpdatingProfile ? "Updating..." : "Update"}
                  </button>
                )}
              </div>

              {/* User Info Section */}
              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-blue-100">
                    {user?.fullname}
                  </span>
                  <span className="text-sm text-blue-400/80">
                    @{user?.username}
                  </span>
                  {!isMyProfile && (
                    <button
                      className="btn rounded-full btn-sm bg-blue-600 hover:bg-blue-500 text-white px-4 mt-2 w-fit transition-all duration-300"
                      onClick={() => navigate(`/chat/${user._id}`)}
                    >
                      Message
                    </button>
                  )}
                  <span className="text-sm my-1 text-blue-200">
                    {user?.bio}
                  </span>
                </div>

                {/* Timetable Section */}
                <div className="p-4 border border-blue-800/50 rounded-lg bg-gray-900/50">
                  <h2 className="text-xl font-bold mb-4 text-blue-300">
                    Set Your Timetable
                  </h2>

                  <form onSubmit={handleSubmit} className="mb-4">
                    <label className="block text-blue-300 mb-1">Day:</label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="border border-blue-800/50 bg-gray-800 text-blue-100 p-2 w-full rounded mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={!editingTable}
                    >
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </option>
                      ))}
                    </select>

                    <label className="block text-blue-300 mb-1">
                      Start Time:
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border border-blue-800/50 bg-gray-800 text-blue-100 p-2 w-full rounded mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={!editingTable}
                    />

                    <label className="block text-blue-300 mb-1">
                      End Time:
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border border-blue-800/50 bg-gray-800 text-blue-100 p-2 w-full rounded mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={!editingTable}
                    />

                    <div className="flex justify-end">
                      {isMyProfile && (
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                            editingTable
                              ? "bg-blue-600 hover:bg-blue-500 text-white"
                              : "bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-800/50"
                          }`}
                          onClick={() => {
                            if (editingTable) {
                              handleSubmit();
                            }
                            setEditingTable(!editingTable);
                          }}
                        >
                          {editingTable ? "Save" : "Edit Timetable"}
                        </button>
                      )}
                    </div>
                  </form>

                  <button
                    className={`px-4 py-2 rounded-full font-medium ${
                      availability === "Available"
                        ? "bg-green-600/30 text-green-400 border border-green-500/50"
                        : "bg-red-600/30 text-red-400 border border-red-500/50"
                    }`}
                  >
                    {availability}
                  </button>

                  <h3 className="text-lg font-bold mt-4 mb-2 text-blue-300">
                    Your Timetable:
                  </h3>
                  {editingTable ? (
                    <pre className="bg-gray-800/50 p-2 rounded text-blue-200 text-sm overflow-x-auto">
                      {JSON.stringify(userTimetable, null, 2)}
                    </pre>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(userTimetable).map(([day, slots]) => (
                        <div
                          key={day}
                          className="bg-gray-800/30 border border-blue-800/50 rounded p-3"
                        >
                          <h4 className="font-bold text-blue-200 mb-2">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </h4>
                          {slots?.length > 0 ? (
                            slots.map((slot, index) => {
                              if (!slot || !slot.start || !slot.end)
                                return null;

                              return (
                                <div
                                  key={index}
                                  className="flex justify-between items-center mb-1 text-sm"
                                >
                                  <span className="text-blue-300">
                                    {slot.start} - {slot.end}
                                  </span>
                                  {isMyProfile && (
                                    <button
                                      onClick={() => handleRemove(day, index)}
                                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-blue-400/70 text-sm">No slots</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profile Links */}
                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center">
                      <FaLink className="w-3 h-3 text-blue-400/80" />
                      <a
                        href={user.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        {user.link}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-blue-400/80" />
                    <span className="text-sm text-blue-400/80">
                      {memberSinceDate}
                    </span>
                  </div>
                </div>

                {/* Follow Stats - Now clickable */}
                <div className="flex gap-4">
                  <div
                    className="flex gap-1 items-center cursor-pointer hover:underline"
                    onClick={() => {
                      setFollowModalType("following");
                      setShowFollowModal(true);
                    }}
                  >
                    <span className="font-bold text-sm text-blue-300">
                      {user?.following?.length || 0}
                    </span>
                    <span className="text-blue-400/80 text-sm">Following</span>
                  </div>
                  <div
                    className="flex gap-1 items-center cursor-pointer hover:underline"
                    onClick={() => {
                      setFollowModalType("follower");
                      setShowFollowModal(true);
                    }}
                  >
                    <span className="font-bold text-sm text-blue-300">
                      {user?.follower?.length || 0}
                    </span>
                    <span className="text-blue-400/80 text-sm">Followers</span>
                  </div>
                </div>
              </div>

              {/* Feed Type Selector */}
              <div className="flex w-full border-b border-blue-800/50 mt-4">
                <div
                  className={`flex justify-center flex-1 p-3 hover:bg-blue-900/30 transition duration-300 relative cursor-pointer ${
                    feedType === "posts" ? "text-blue-300" : "text-blue-400/80"
                  }`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <div
                  className={`flex justify-center flex-1 p-3 hover:bg-blue-900/30 transition duration-300 relative cursor-pointer ${
                    feedType === "likes" ? "text-blue-300" : "text-blue-400/80"
                  }`}
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
              </div>
            </>
          )}

          <Posts feedType={feedType} username={username} userId={user?._id} />
        </div>
      </div>

      {/* Follow Modal */}
      {showFollowModal && user && (
        <FollowModal
          userId={user._id}
          type={followModalType}
          onClose={() => setShowFollowModal(false)}
        />
      )}
    </>
  );
};

export default ProfilePage;
