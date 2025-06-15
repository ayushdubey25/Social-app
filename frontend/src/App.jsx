import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";
import ChatPage from "./pages/profile/ChatPage.jsx";
import { useEffect, useState } from "react";
import { AuthProvider } from "../src/hooks/AuthContext";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) throw new Error(data.error || "Connection error");
        return data;
      } catch (error) {
        throw new Error("Network connection failed");
      }
    },
    retry: false,
  });

  // Animation states
  const [powerOn, setPowerOn] = useState(false);
  const [circuitPulse, setCircuitPulse] = useState(false);
  const [randomFlicker, setRandomFlicker] = useState(0);
  const [activeNodes, setActiveNodes] = useState([]);

  // Power on sequence
  useEffect(() => {
    const timer = setTimeout(() => setPowerOn(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Gentle circuit pulses (every 8-12 seconds)
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setCircuitPulse(true);
      setTimeout(() => setCircuitPulse(false), 2000);
    }, 10000 + Math.random() * 4000);
    return () => clearInterval(pulseInterval);
  }, []);

  // Subtle random flickering
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setRandomFlicker(1);
        setTimeout(() => setRandomFlicker(0), 300 + Math.random() * 500);
      }
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(flickerInterval);
  }, []);

  // Node activation sequence
  useEffect(() => {
    const nodeCount = 18;
    const activateNodes = () => {
      const newActiveNodes = Array(nodeCount)
        .fill(0)
        .map(() => Math.random() > 0.8);
      setActiveNodes(newActiveNodes);
      setTimeout(() => setActiveNodes(Array(nodeCount).fill(0)), 1500);
    };

    const nodeInterval = setInterval(activateNodes, 2500);
    return () => clearInterval(nodeInterval);
  }, []);

  if (isLoading) {
    return (
      <div
        className={`h-screen w-full flex justify-center items-center bg-gray-900 transition-all duration-500 ${
          randomFlicker ? "brightness-110" : ""
        }`}
      >
        <div className="relative z-50 text-center">
          {/* Soft power-on glow */}
          <div
            className={`absolute -inset-8 rounded-full bg-blue-500/10 ${
              powerOn ? "animate-[fadeIn_2s_ease-out]" : "opacity-0"
            }`}
          ></div>

          <LoadingSpinner
            size="lg"
            className={`relative z-10 text-blue-400 ${
              circuitPulse
                ? "animate-[softPulse_3s_ease-in-out]"
                : "animate-spin"
            }`}
            style={{
              filter: `drop-shadow(0 0 10px rgba(59, 130, 246, ${
                0.3 + randomFlicker / 10
              }))`,
              strokeWidth: "3px",
              animationDuration: "2s",
            }}
          />
          <p
            className={`mt-6 text-xl font-mono text-blue-300 transition-opacity duration-500 ${
              powerOn ? "opacity-100" : "opacity-0"
            }`}
          >
            Connecting to Circuit Network
            <span className="ml-1 inline-block animate-blink">|</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider value={{ authUser }}>
      <div
        className={`min-h-screen w-full bg-gray-900 transition-all duration-1000 ${
          circuitPulse ? "brightness-105" : ""
        }`}
      >
        {/* Relaxed Circuit Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
          {/* Flowing circuit traces */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Horizontal traces */}
            <path
              d="M0 25 L100 25"
              stroke="url(#circuitGradient)"
              strokeWidth="1.5"
              strokeDasharray="15 10"
              className="animate-circuitFlow"
              style={{ animationDuration: "30s" }}
            />
            <path
              d="M0 50 L100 50"
              stroke="url(#circuitGradient)"
              strokeWidth="1.5"
              strokeDasharray="20 15"
              className="animate-circuitFlowReverse"
              style={{ animationDuration: "40s" }}
            />
            <path
              d="M0 75 L100 75"
              stroke="url(#circuitGradient)"
              strokeWidth="1.5"
              strokeDasharray="12 18"
              className="animate-circuitFlow"
              style={{ animationDuration: "35s" }}
            />

            {/* Vertical traces */}
            <path
              d="M15 0 L15 100"
              stroke="url(#circuitGradient)"
              strokeWidth="1.5"
              strokeDasharray="18 12"
              className="animate-circuitFlowVertical"
              style={{ animationDuration: "25s" }}
            />
            <path
              d="M85 0 L85 100"
              stroke="url(#circuitGradient)"
              strokeWidth="1.5"
              strokeDasharray="10 20"
              className="animate-circuitFlowVerticalReverse"
              style={{ animationDuration: "45s" }}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id="circuitGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="transparent" />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating circuit nodes */}
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full transition-all duration-1000 ${
                activeNodes[i] ? "bg-blue-500/70" : "bg-blue-500/20"
              }`}
              style={{
                width: "8px",
                height: "8px",
                top: `${5 + (i % 6) * 18}%`,
                left: `${10 + Math.floor(i / 6) * 25}%`,
                filter: "blur(0.5px)",
                boxShadow: `0 0 ${
                  activeNodes[i] ? "12px" : "4px"
                } rgba(59, 130, 246, ${activeNodes[i] ? "0.6" : "0.3"})`,
                transform: activeNodes[i] ? "scale(1.5)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Main content with subtle glow */}
        <div
          className={`relative flex w-full min-h-screen backdrop-blur-sm transition-all duration-500 ${
            randomFlicker ? "backdrop-brightness-102" : ""
          }`}
        >
          <Toaster position="top-right" />
          {authUser && <Sidebar />}

          <main className="flex-1 overflow-y-auto z-10">
            <Routes>
              <Route
                path="/"
                element={authUser ? <HomePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={!authUser ? <LoginPage /> : <Navigate to="/" />}
              />
              <Route
                path="/signup"
                element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
              />
              <Route
                path="/notifications"
                element={
                  authUser ? <NotificationPage /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/profile/:username"
                element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/chat/:userId"
                element={authUser ? <ChatPage /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>

          {authUser && <RightPanel />}
        </div>

        {/* Smooth Toaster */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              color: "#e2e8f0",
              border: "1px solid #3b82f6",
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              backdropFilter: "blur(8px)",
              padding: "16px",
              fontSize: "1rem",
              transition: "all 0.5s ease",
            },
            success: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#0f172a",
              },
              style: {
                border: "1px solid #3b82f6",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#0f172a",
              },
              style: {
                border: "1px solid #ef4444",
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.3)",
              },
            },
          }}
        />

        {/* Global styles */}
        <style>{`
        @keyframes circuitFlow {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.5;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.5;
          }
        }
        @keyframes circuitFlowReverse {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.5;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 100;
            opacity: 0.5;
          }
        }
        @keyframes circuitFlowVertical {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.5;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.5;
          }
        }
        @keyframes circuitFlowVerticalReverse {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.5;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 100;
            opacity: 0.5;
          }
        }
        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-blink {
          animation: blink 1.5s ease-in-out infinite;
        }
        .animate-circuitFlow {
          animation: circuitFlow linear infinite;
        }
        .animate-circuitFlowReverse {
          animation: circuitFlowReverse linear infinite;
        }
        .animate-circuitFlowVertical {
          animation: circuitFlowVertical linear infinite;
        }
        .animate-circuitFlowVerticalReverse {
          animation: circuitFlowVerticalReverse linear infinite;
        }
      `}</style>
      </div>
    </AuthProvider>
  );
}

export default App;
