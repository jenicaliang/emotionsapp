import { Outlet, useLocation, useNavigate } from "react-router";
import { useState, createContext, useContext } from "react";
import { CurrentUserProvider } from "../context/CurrentUserContext";
import { Toaster } from "./ui/sonner";
import { AnimatedLogo } from "./AnimatedLogo";
import { motion } from "motion/react";
import { Circle } from "lucide-react";
import svgPaths from "../../imports/svg-btgip5ewgi";

// Context for capture controls
interface CaptureContextType {
  registerCaptureControls: (startFn: () => void, stopFn: () => void) => void;
  unregisterCaptureControls: () => void;
  captureState: "ready" | "recording";
  recordingTime: number;
  updateCaptureState: (state: "ready" | "recording", time: number) => void;
}

const CaptureContext = createContext<CaptureContextType | null>(null);

export const useCaptureControls = () => {
  const context = useContext(CaptureContext);
  if (!context) {
    throw new Error("useCaptureControls must be used within Layout");
  }
  return context;
};

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [captureControls, setCaptureControls] = useState<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const [captureState, setCaptureState] = useState<"ready" | "recording">("ready");
  const [recordingTime, setRecordingTime] = useState(0);

  const registerCaptureControls = (startFn: () => void, stopFn: () => void) => {
    setCaptureControls({ start: startFn, stop: stopFn });
  };

  const unregisterCaptureControls = () => {
    setCaptureControls(null);
    setCaptureState("ready");
    setRecordingTime(0);
  };

  const updateCaptureState = (state: "ready" | "recording", time: number) => {
    setCaptureState(state);
    setRecordingTime(time);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isMapActive = isActive("/") && !isActive("/capture") && !isActive("/profile");
  const isCaptureActive = isActive("/capture");
  const isProfileActive = isActive("/profile");

  const handleFeelButtonClick = () => {
    if (!isCaptureActive) {
      navigate("/capture");
    } else {
      if (captureControls) {
        if (captureState === "ready") {
          captureControls.start();
        } else if (captureState === "recording" && recordingTime >= 5) {
          captureControls.stop();
        }
      }
    }
  };

  const contextValue: CaptureContextType = {
    registerCaptureControls,
    unregisterCaptureControls,
    captureState,
    recordingTime,
    updateCaptureState,
  };

  return (
    <CaptureContext.Provider value={contextValue}>
      <CurrentUserProvider>
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        {/* Mobile Container */}
        <div className="relative h-screen w-full max-w-[430px] bg-background flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-5 pt-5 pb-4 bg-background relative z-10">
            <AnimatedLogo />
            <p className="text-[13px] mt-0.5" style={{ color: "#A39B94" }}>
              What are you feeling today <span className="font-semibold">Christine</span>?
            </p>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden relative">
            <Outlet />
          </main>

          {/* Bottom Navigation */}
          <nav className="bg-white relative z-10 pb-5">
            <div className="relative h-20 flex items-end justify-around px-8">
              {/* Map Button */}
              <button
                onClick={() => navigate("/")}
                className="flex flex-col items-center gap-1.5 min-w-[60px] transition-all active:scale-95 hover:bg-[#f5efe7]/40 rounded-xl py-2 px-3 -mx-3"
              >
                <div className="relative size-6">
                  <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p1dbaa200} stroke={isMapActive ? "#5A5A5A" : "#D1C7BD"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d="M15 5.762V20.758" stroke={isMapActive ? "#5A5A5A" : "#D1C7BD"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d="M9 3.235V18.23" stroke={isMapActive ? "#5A5A5A" : "#D1C7BD"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-[12px] font-medium transition-colors" style={{ color: isMapActive ? "#5A5A5A" : "#D1C7BD" }}>
                  Map
                </span>
              </button>

              {/* Feel Button - Elevated Center */}
              <button
                onClick={handleFeelButtonClick}
                className="flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                disabled={isCaptureActive && captureState === "recording" && recordingTime < 5}
              >
                <motion.div
                  className="shadow-lg w-16 h-16 shrink-0 aspect-square flex items-center justify-center border-4 border-white transition-shadow hover:shadow-xl rounded-full"
                  animate={{
                    backgroundColor: isCaptureActive && captureState === "recording" && recordingTime < 5 ? "#D1C7BD" : isCaptureActive ? "#E74C3C" : "#f5efe7",
                    borderRadius: isCaptureActive && captureState === "recording" && recordingTime >= 5 ? "12px" : "50%",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {!isCaptureActive ? (
                    <div className="relative size-6">
                      <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p27658200} stroke="#8B7E74" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path d={svgPaths.p21e1b300} stroke="#8B7E74" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </div>
                  ) : captureState === "ready" ? (
                    <Circle size={24} strokeWidth={1.5} style={{ color: "#FFFFFF", fill: "#FFFFFF" }} />
                  ) : (
                    <motion.div
                      className="bg-white"
                      animate={{
                        width: recordingTime >= 5 ? "18px" : "20px",
                        height: recordingTime >= 5 ? "18px" : "20px",
                        borderRadius: recordingTime >= 5 ? "3px" : "50%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
                <span className="text-[12px] font-medium transition-colors" style={{ color: isCaptureActive ? "#8B7E74" : "#A39B94" }}>
                  Feel
                </span>
              </button>

              {/* You Button */}
              <button
                onClick={() => navigate("/profile")}
                className="flex flex-col items-center gap-1.5 min-w-[60px] transition-all active:scale-95 hover:bg-[#f5efe7]/40 rounded-xl py-2 px-3 -mx-3"
              >
                <div className="relative size-6">
                  <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.pf20da00} stroke={isProfileActive ? "#5A5A5A" : "#D1C7BD"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    <path d={svgPaths.p180caa00} stroke={isProfileActive ? "#5A5A5A" : "#D1C7BD"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-[12px] font-medium transition-colors" style={{ color: isProfileActive ? "#5A5A5A" : "#D1C7BD" }}>
                  You
                </span>
              </button>
            </div>
          </nav>

          {/* Toaster for notifications */}
          <Toaster />
        </div>
      </div>
      </CurrentUserProvider>
    </CaptureContext.Provider>
  );
}