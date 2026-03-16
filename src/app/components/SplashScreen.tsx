import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [message, setMessage] = useState("Initializing emotional surveillance...");

  useEffect(() => {
    const messages = [
      "Initializing emotional surveillance...",
      "Calibrating sentiment analysis...",
      "We're ready to understand you now",
    ];

    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < messages.length) {
        setMessage(messages[index]);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1
          className="text-[48px] tracking-tight mb-2"
          style={{ color: "#8B7E74" }}
        >
          Presents
        </h1>
      </motion.div>

      <motion.div
        className="w-32 h-1 bg-secondary rounded-full overflow-hidden mb-6"
      >
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-[13px] text-center max-w-[280px]"
          style={{ color: "#A39B94" }}
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
