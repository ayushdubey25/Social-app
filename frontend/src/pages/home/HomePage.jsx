import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="flex-[4_4_0] mr-auto min-h-screen bg-gray-900 text-blue-100 relative overflow-hidden">
      {/* Enhanced Circuit Background */}
      <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/20 to-transparent"></div>

        {/* Main circuit lines with smoother animation */}
        {[
          { top: "0", left: "25%", delay: "0s", duration: "8s" },
          { top: "33%", left: "0", delay: "1.5s", duration: "12s" },
          { top: "66%", left: "80%", delay: "2.5s", duration: "10s" },
          { top: "85%", left: "35%", delay: "3.5s", duration: "15s" },
        ].map((line, index) => (
          <div
            key={index}
            className={`absolute w-0.5 h-full bg-blue-500`}
            style={{
              top: line.top,
              left: line.left,
              animation: `pulse ${line.duration} ease-in-out infinite ${line.delay}`,
              boxShadow: "0 0 12px 3px rgba(59, 130, 246, 0.6)",
            }}
          ></div>
        ))}

        {/* Horizontal lines */}
        {[
          { top: "20%", delay: "0.5s", duration: "15s" },
          { top: "50%", delay: "2s", duration: "20s" },
          { top: "80%", delay: "3s", duration: "18s" },
        ].map((line, index) => (
          <div
            key={index}
            className={`absolute w-full h-0.5 bg-blue-500`}
            style={{
              top: line.top,
              animation: `pulse ${line.duration} ease-in-out infinite ${line.delay}`,
              boxShadow: "0 0 12px 3px rgba(59, 130, 246, 0.6)",
            }}
          ></div>
        ))}
      </div>

      {/* Header with smoother transitions */}
      <div className="flex w-full border-b border-blue-800/30 relative z-10 backdrop-blur-sm bg-gray-900/70 transition-all duration-500">
        {["forYou", "following"].map((type) => (
          <div
            key={type}
            className={`flex justify-center flex-1 p-4 transition-all duration-500 cursor-pointer relative group ${
              feedType === type
                ? "text-blue-300 bg-blue-900/20"
                : "text-blue-200 hover:bg-blue-900/10"
            }`}
            onClick={() => setFeedType(type)}
          >
            <span className="relative z-10 flex items-center">
              <svg
                className={`w-5 h-5 mr-2 transition-all duration-300 ${
                  feedType === type ? "text-blue-400" : "text-blue-300/80"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {type === "forYou" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                )}
              </svg>
              {type === "forYou" ? "Your Frequency" : "Your Nodes"}
            </span>
            {feedType === type && (
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-blue-400 transition-all duration-500"
                style={{ boxShadow: "0 0 12px 3px rgba(59, 130, 246, 0.5)" }}
              ></div>
            )}
            <div
              className={`absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                feedType === type ? "opacity-20" : ""
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* CREATE POST INPUT */}
      <div className="relative z-10 transition-all duration-300 hover:bg-gray-900/30">
        <CreatePost />
      </div>

      {/* POSTS with subtle entrance animation */}
      <div className="relative z-10 animate-fadeIn">
        <Posts feedType={feedType} />
      </div>

      {/* Floating circuit elements with smoother movement */}
      {[
        {
          top: "15%",
          right: "8%",
          size: "w-8 h-8",
          animation: "pulse 6s infinite 1s",
        },
        {
          bottom: "30%",
          left: "8%",
          size: "w-6 h-6",
          animation: "pulse 8s infinite 2s",
          rotate: "rotate-45",
        },
        {
          top: "25%",
          right: "25%",
          size: "w-3 h-3",
          animation: "ping 4s infinite 0.5s",
        },
      ].map((element, index) => (
        <div
          key={index}
          className={`absolute rounded-full border-2 border-blue-500/40 ${
            element.rotate || ""
          }`}
          style={{
            top: element.top,
            bottom: element.bottom,
            left: element.left,
            right: element.right,
            width: element.size.split(" ")[0],
            height: element.size.split(" ")[1],
            animation: element.animation,
            boxShadow: "0 0 8px 2px rgba(59, 130, 246, 0.4)",
          }}
        ></div>
      ))}

      {/* Global styles for animations */}
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0.95;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
