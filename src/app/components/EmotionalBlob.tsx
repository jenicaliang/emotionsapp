import { Emotion } from "../types";
import { emotionColors } from "../data/mockData";
import { motion } from "motion/react";
import Frame5 from "../../imports/Frame5";
import Frame6 from "../../imports/Frame6";
import Frame7 from "../../imports/Frame7";
import Frame8 from "../../imports/Frame8";
import Frame9 from "../../imports/Frame9";
import Frame10 from "../../imports/Frame10";
import Frame11 from "../../imports/Frame11";

interface EmotionalBlobProps {
  emotion: Emotion;
  size?: number;
  showFace?: boolean;
  animate?: boolean;
}

export function EmotionalBlob({
  emotion,
  size = 60,
  showFace = true,
  animate = true,
}: EmotionalBlobProps) {
  const color = emotionColors[emotion];

  // Face components for each emotion
  const getFace = () => {
    switch (emotion) {
      case "Happy":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame6 />
          </div>
        );
      case "Sad":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame8 />
          </div>
        );
      case "Surprise":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame5 />
          </div>
        );
      case "Fear":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame11 />
          </div>
        );
      case "Disgust":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame10 />
          </div>
        );
      case "Angry":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame9 />
          </div>
        );
      case "Contempt":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame9 />
          </div>
        );
      case "Neutral":
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame7 />
          </div>
        );
      default:
        return (
          <div style={{ width: size * 0.6, height: size * 0.3 }}>
            <Frame7 />
          </div>
        );
    }
  };

  // Get shape style based on emotion
  const getShapeStyle = () => {
    switch (emotion) {
      case "Happy":
        // Buoyant, upward stretching shape
        return {
          borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
          transform: "scaleY(1.05)",
        };
      case "Sad":
        // Droopy, downward sagging shape
        return {
          borderRadius: "45% 45% 50% 50% / 40% 40% 60% 60%",
          transform: "scaleY(1.05)",
        };
      case "Angry":
        // Sharp, aggressive angular shape
        return {
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          transform: "rotate(45deg) scale(1)",
        };
      case "Fear":
        // Trembling, irregular spiky shape
        return {
          borderRadius: "40% 60% 70% 30% / 50% 30% 70% 50%",
          transform: "scale(1)",
        };
      case "Disgust":
        // Twisted, asymmetric repulsed shape
        return {
          borderRadius: "65% 35% 40% 60% / 30% 65% 35% 70%",
          transform: "rotate(-15deg) scale(1)",
        };
      case "Contempt":
        // Scornful, dismissive tilted shape
        return {
          borderRadius: "50% 50% 45% 45% / 45% 45% 50% 50%",
          transform: "rotate(15deg) scale(1)",
        };
      case "Surprise":
        // Explosive, starburst outward shape
        return {
          borderRadius: "40% 60% 50% 50% / 60% 40% 60% 40%",
          transform: "scale(1.05)",
        };
      case "Neutral":
        // Balanced, simple oval
        return {
          borderRadius: "50%",
          transform: "scale(1)",
        };
      default:
        return {
          borderRadius: "50%",
          transform: "scale(1)",
        };
    }
  };

  // Get animation variants based on emotion
  const getAnimationVariants = () => {
    switch (emotion) {
      case "Neutral":
        return {
          idle: {
            y: [-2, 2, -2],
            scale: [1.05, 1.08, 1.05],
          },
        };
      case "Surprise":
        return {
          idle: {
            y: [0, 2, 0],
            scale: [1.05, 1.03, 1.05],
          },
        };
      case "Sad":
        return {
          idle: {
            rotate: [43, 47, 43],
            scale: [1, 1.05, 1],
          },
        };
      case "Angry":
        return {
          idle: {
            x: [-1, 1, -1, 1, -1],
            scale: [1, 1.02, 1, 1.02, 1],
          },
        };
      case "Fear":
        return {
          idle: {
            rotate: [-17, -13, -17],
            scale: [1, 0.98, 1],
          },
        };
      case "Contempt":
        return {
          idle: {
            rotate: [5, -5, 5, -5, 5],
            scale: [1, 1.02, 1, 1.02, 1],
          },
        };
      case "Disgust":
        return {
          idle: {
            scale: [1, 1.02, 1],
          },
        };
      case "Happy":
        return {
          idle: {
            scale: [1, 1.02, 1],
          },
        };
      default:
        return {
          idle: {
            scale: [1, 1.02, 1],
          },
        };
    }
  };

  const blobVariants = getAnimationVariants();
  const shapeStyle = getShapeStyle();

  const face = getFace();
  const isCustomFace = true; // All faces are now custom SVGs

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={animate ? "idle" : undefined}
      variants={blobVariants}
      transition={{
        duration: emotion === "Fear" ? 2.5 : 3,
        repeat: Infinity,
        ease: emotion === "Fear" ? "easeInOut" : "easeInOut",
      }}
    >
      {/* Abstract emotion shape */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          borderRadius: shapeStyle.borderRadius,
          transform: shapeStyle.transform,
          boxShadow: `0 4px 20px ${color}40`,
        }}
      />

      {/* Face */}
      {showFace && (
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            fontSize: isCustomFace ? undefined : size * 0.35,
            color: "#5A5A5A",
            textShadow: isCustomFace ? undefined : "0 1px 2px rgba(255,255,255,0.5)",
            transform:
              emotion === "Angry"
                ? "rotate(-45deg)"
                : emotion === "Disgust"
                ? "rotate(15deg)"
                : "none",
          }}
        >
          {face}
        </div>
      )}
    </motion.div>
  );
}