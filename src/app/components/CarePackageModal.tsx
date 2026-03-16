import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flower2, Heart, Coffee, Star, CircleDot, Send, Eye, ChevronRight, Users, Check } from "lucide-react";
import { Friend, CarePackage, CarePackageItem } from "../types";
import { toast } from "sonner";

interface CarePackageModalProps {
  onClose: () => void;
  recipient?: Friend;
  packageToOpen?: CarePackage;
}

const giftItems: CarePackageItem[] = [
  { id: "flowers", type: "flowers", label: "Flowers" },
  { id: "balloon", type: "balloon", label: "Balloon" },
  { id: "hug", type: "hug", label: "Hug" },
  { id: "tea", type: "tea", label: "Tea" },
  { id: "star", type: "star", label: "Star" },
  { id: "heart", type: "heart", label: "Heart" },
];

// Custom Balloon Icon Component
const BalloonIcon = ({ size = 24, color = "#8B7E74" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Balloon body */}
    <path 
      d="M12 3C9 3 6.5 5.5 6.5 9C6.5 11.5 8 13.5 10 14.5L11 17L13 17L14 14.5C16 13.5 17.5 11.5 17.5 9C17.5 5.5 15 3 12 3Z" 
      fill={color}
      fillOpacity="0.2"
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Balloon shine */}
    <ellipse 
      cx="10" 
      cy="7" 
      rx="2" 
      ry="3" 
      fill="white" 
      opacity="0.4"
    />
    {/* String */}
    <path 
      d="M12 17 Q11 19, 12 21" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
    />
    {/* Knot */}
    <circle 
      cx="12" 
      cy="17" 
      r="0.8" 
      fill={color}
    />
  </svg>
);

const getItemIcon = (type: string) => {
  switch (type) {
    case "flowers":
      return Flower2;
    case "heart":
      return Heart;
    case "tea":
      return Coffee;
    case "star":
      return Star;
    case "balloon":
      return BalloonIcon;
    case "hug":
      return Users;
    default:
      return CircleDot;
  }
};

const getItemLabel = (type: string) => {
  switch (type) {
    case "flowers":
      return "Flowers";
    case "balloon":
      return "Balloon";
    case "hug":
      return "Hug";
    case "tea":
      return "Tea";
    case "star":
      return "Star";
    case "heart":
      return "Heart";
    default:
      return type;
  }
};

export function CarePackageModal({
  onClose,
  recipient,
  packageToOpen,
}: CarePackageModalProps) {
  const [selectedItems, setSelectedItems] = useState<CarePackageItem[]>([]);
  const [letter, setLetter] = useState("");
  const [openingState, setOpeningState] = useState<"sealed" | "peeling" | "experiencing" | "letter" | "thanked">(
    packageToOpen ? "sealed" : "composing"
  );
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewItemIndex, setPreviewItemIndex] = useState(0);
  const [previewState, setPreviewState] = useState<"items" | "letter">("items");

  const maxLetterWords = 50;
  const wordCount = letter.trim().split(/\s+/).filter(word => word.length > 0).length;

  const toggleItem = (item: CarePackageItem) => {
    setSelectedItems((prev) => {
      // If clicking the already selected item, deselect it
      if (prev.find((i) => i.id === item.id)) {
        return [];
      }
      // Otherwise, replace with the new selection (only one allowed)
      return [item];
    });
  };

  const sendPackage = () => {
    toast("Care package dispatched", {
      description: "Your emotional gesture has been algorithmically optimized and sent.",
      icon: <Check size={18} strokeWidth={2.5} style={{ color: "#5A5A5A" }} />,
    });
    onClose();
  };

  const startOpening = () => {
    setOpeningState("peeling");
    setTimeout(() => {
      if (packageToOpen && packageToOpen.items.length > 0) {
        setOpeningState("experiencing");
        setCurrentItemIndex(0);
      } else {
        if (packageToOpen?.letter) {
          setOpeningState("letter");
        } else {
          setOpeningState("thanked");
        }
      }
    }, 2000);
  };

  const nextItem = () => {
    if (packageToOpen) {
      // Since we now limit to one item, go directly to letter or thanked
      if (packageToOpen.letter) {
        setOpeningState("letter");
      } else {
        setOpeningState("thanked");
      }
    }
  };

  const sendThanks = () => {
    onClose();
  };

  const startPreview = () => {
    setIsPreviewing(true);
    setPreviewItemIndex(0);
    setPreviewState("items");
  };

  const closePreview = () => {
    setIsPreviewing(false);
    setPreviewItemIndex(0);
    setPreviewState("items");
  };

  const nextPreviewItem = () => {
    if (previewState === "items") {
      if (previewItemIndex < selectedItems.length - 1) {
        setPreviewItemIndex(previewItemIndex + 1);
      } else {
        // Move to letter if exists
        if (letter.trim()) {
          setPreviewState("letter");
        } else {
          // Loop back to start
          setPreviewItemIndex(0);
        }
      }
    } else {
      // From letter, loop back to first item
      setPreviewItemIndex(0);
      setPreviewState("items");
    }
  };

  // Interactive gift component with automatic animations
  const InteractiveGift = ({ item, isPreview = false }: { item: CarePackageItem; isPreview?: boolean }) => {
    return (
      <>
        {/* Background effects */}
        {item.type === "hug" && (
          <>
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundColor: ["#F5EFE7", "#FFE8E0", "#F5EFE7"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {/* Expanding warm circles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
              >
                <motion.div
                  className="rounded-full border-2"
                  style={{ borderColor: "#FFD4CC" }}
                  animate={{ scale: [0, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                />
              </motion.div>
            ))}
          </>
        )}

        {item.type === "tea" && (
          <>
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "linear-gradient(to top, #E8DFD5 0%, #F5EFE7 100%)",
                  "linear-gradient(to top, #D4C8BE 0%, #F5EFE7 100%)",
                  "linear-gradient(to top, #E8DFD5 0%, #F5EFE7 100%)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            {/* Rising steam particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: "#D4C8BE",
                  left: `${30 + Math.random() * 40}%`,
                  bottom: "30%",
                }}
                animate={{
                  y: [-20, -200 - Math.random() * 100],
                  x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 60],
                  opacity: [0, 0.6, 0],
                  scale: [0.3, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {item.type === "flowers" && (
          <>
            {/* Auto-blooming flowers across the screen - artistic organic pattern */}
            {[...Array(40)].map((_, i) => {
              // Create organic, artistic positioning using golden ratio and fibonacci-like spiral
              const angle = i * 137.5 * (Math.PI / 180); // Golden angle
              const radius = Math.sqrt(i + 1) * 8; // Tighter spiral, stays in viewport
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  initial={{ scale: 0, rotate: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.3, 1],
                    rotate: [0, 180 + (i * 15), 360 + (i * 15)],
                    opacity: [0, 1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <Flower2
                    size={20 + Math.random() * 16}
                    style={{ color: ["#E8A8A0", "#F5B8B0", "#FFD4CC", "#FFC4BC", "#FFB4AC"][i % 5] }}
                  />
                  {/* Petal particles */}
                  {[...Array(5)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: "#FFD4CC",
                        left: "50%",
                        top: "50%",
                      }}
                      animate={{
                        x: [0, (Math.cos(j * Math.PI / 2.5) * 35)],
                        y: [0, (Math.sin(j * Math.PI / 2.5) * 35)],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.08 + 0.6,
                      }}
                    />
                  ))}
                </motion.div>
              );
            })}
          </>
        )}

        {item.type === "balloon" && (
          <>
            {/* Multiple balloons floating up */}
            {[...Array(12)].map((_, i) => {
              const balloonColors = ["#B8A8D0", "#D4C8E0", "#E8D8F0"];
              const balloonColor = balloonColors[i % 3];
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${15 + (i % 4) * 20}%`,
                    bottom: "-10%",
                  }}
                  animate={{
                    y: [-50, -900],
                    x: [0, (Math.sin(i) * 40)],
                    rotate: [0, (Math.random() - 0.5) * 30],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 3,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                >
                  <BalloonIcon
                    size={36 + Math.random() * 12}
                    color={balloonColor}
                  />
                </motion.div>
              );
            })}
          </>
        )}

        {item.type === "heart" && (
          <>
            {/* Hearts pulsing and floating */}
            {[...Array(20)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 20;
              const radius = 150 + (i % 3) * 50;
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  animate={{
                    x: [0, Math.cos(angle) * radius],
                    y: [0, Math.sin(angle) * radius],
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Heart
                    size={24 + Math.random() * 16}
                    fill="#E8A8A0"
                    style={{ color: "#E8A8A0" }}
                  />
                </motion.div>
              );
            })}
          </>
        )}

        {item.type === "star" && (
          <>
            {/* Twinkling stars across the screen */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, rotate: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0.5, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0.5, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Star
                  size={16 + Math.random() * 16}
                  fill="#F5D98F"
                  style={{ color: "#F5D98F" }}
                />
                {/* Star twinkle particles */}
                {[...Array(4)].map((_, j) => (
                  <motion.div
                    key={j}
                    className="absolute w-1 h-4 rounded-full"
                    style={{
                      backgroundColor: "#F5D98F",
                      left: "50%",
                      top: "50%",
                      rotate: `${j * 90}deg`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scaleY: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.15 + 0.3,
                      repeat: Infinity,
                      repeatDelay: 4,
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </>
        )}

        {/* Title and subtitle at top */}
        <div className="absolute top-16 left-0 right-0 px-8 pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[24px] mb-2 text-center"
            style={{ color: "#5A5A5A" }}
          >
            {getItemLabel(item.type)}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[13px] text-center max-w-[280px] mx-auto"
            style={{ color: "#A39B94" }}
          >
            {item.type === "flowers" && "Watch the garden bloom before your eyes"}
            {item.type === "balloon" && "Floating away into the sky"}
            {item.type === "hug" && "Feel the warmth of simulated affection"}
            {item.type === "tea" && "Let the conceptual warmth wash over you"}
            {item.type === "star" && "A constellation of care just for you"}
            {item.type === "heart" && "Love radiating in all directions"}
          </motion.p>

          {isPreview && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[11px] text-center mt-2"
              style={{ color: "#A39B94" }}
            >
              (Preview only)
            </motion.p>
          )}
        </div>

        {/* Center icon/visual element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {/* Hug icon with Users icon */}
          {item.type === "hug" && (
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={120} strokeWidth={1.5} style={{ color: "#8B7E74" }} />
            </motion.div>
          )}
        </div>

        {/* Next button at bottom - only for non-preview */}
        {!isPreview && (
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-[100]">
            {/* Arrow button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                nextItem();
              }}
              className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors z-[101] pointer-events-auto"
            >
              <ChevronRight size={24} style={{ color: "#8B7E74" }} />
            </motion.button>
          </div>
        )}
      </>
    );
  };

  // Rendering for opening a received package
  if (packageToOpen) {
    return (
      <>
        {/* Fullscreen background - over everything within mobile view */}
        <div
          className="fixed inset-0 bg-background"
          style={{ zIndex: 10000 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          />

          {/* Close button always visible */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-secondary shadow-lg z-[10002] border-2 border-border hover:bg-primary hover:border-primary transition-colors"
          >
            <X size={20} style={{ color: "#8B7E74" }} />
          </button>

          <AnimatePresence mode="wait">
            {openingState === "sealed" && (
              <motion.div
                key="sealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8"
              >
                <h3 className="text-[22px] mb-2" style={{ color: "#5A5A5A" }}>
                  Care Package from {packageToOpen.from.name}
                </h3>
                <p className="text-[12px] mb-12" style={{ color: "#A39B94" }}>
                  Expires in 23 hours
                </p>

                {/* Cardboard box illustration */}
                <motion.button
                  onClick={startOpening}
                  className="relative w-80 h-80 mb-8 cursor-pointer"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-dashed"
                    style={{
                      backgroundColor: "#D4C8BE",
                      borderColor: "#8B7E74",
                    }}
                  />

                  <motion.div
                    className="absolute left-1/2 top-0 bottom-0 w-20 -translate-x-1/2"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.9 }}
                    animate={{
                      opacity: [0.9, 0.7, 0.9],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.9 }}
                    animate={{
                      opacity: [0.9, 0.7, 0.9],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card px-8 py-4 rounded-2xl shadow-lg border border-border">
                      <p className="text-[17px] font-medium" style={{ color: "#8B7E74" }}>
                        Tap to open
                      </p>
                    </div>
                  </div>
                </motion.button>

                <p className="text-[12px] text-center italic max-w-[280px]" style={{ color: "#A39B94" }}>
                  A tactile ritual for a digital gesture
                </p>
              </motion.div>
            )}

            {openingState === "peeling" && (
              <motion.div
                key="peeling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  className="relative w-64 h-64"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-dashed"
                    style={{
                      backgroundColor: "#D4C8BE",
                      borderColor: "#8B7E74",
                    }}
                  />

                  <motion.div
                    className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 origin-top"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.8 }}
                    animate={{
                      scaleY: [1, 0.5, 0],
                      opacity: [0.8, 0.5, 0],
                    }}
                    transition={{ duration: 2 }}
                  />
                </motion.div>

                <p className="text-[14px] mt-12" style={{ color: "#A39B94" }}>
                  Unsealing your emotions
                </p>
              </motion.div>
            )}

            {openingState === "experiencing" && packageToOpen.items[currentItemIndex] && (
              <motion.div
                key={`experience-${currentItemIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <InteractiveGift item={packageToOpen.items[currentItemIndex]} />
              </motion.div>
            )}

            {openingState === "letter" && packageToOpen.letter && (
              <motion.div
                key="letter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8"
              >
                <motion.div
                  initial={{ scale: 0.9, rotateX: 90 }}
                  animate={{ scale: 1, rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-secondary rounded-2xl p-8 max-w-sm w-full shadow-2xl mb-8"
                >
                  <p className="text-[12px] mb-4" style={{ color: "#A39B94" }}>
                    A message (50 words max)
                  </p>
                  <p className="text-[15px] leading-relaxed italic" style={{ color: "#5A5A5A" }}>
                    "{packageToOpen.letter}"
                  </p>
                  <p className="text-[11px] mt-4 text-right" style={{ color: "#A39B94" }}>
                    — {packageToOpen.from.name}
                  </p>
                </motion.div>

                <button
                  onClick={sendThanks}
                  className="px-12 py-4 bg-primary text-primary-foreground rounded-full text-[15px]"
                >
                  Thanks!
                </button>

                <p className="text-[11px] text-center mt-4 max-w-[240px]" style={{ color: "#A39B94" }}>
                  (This is your only response option)
                </p>
              </motion.div>
            )}

            {openingState === "thanked" && (
              <motion.div
                key="thanked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: "#E8DFD5" }}
                  >
                    <Heart size={48} fill="#8B7E74" style={{ color: "#8B7E74" }} />
                  </div>
                </motion.div>
                <p className="text-[18px]" style={{ color: "#5A5A5A" }}>
                  Your appreciation has been noted
                </p>
                <p className="text-[12px] mt-2" style={{ color: "#A39B94" }}>
                  Logging gratitude metrics...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // Rendering for composing a new package
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-[9998]"
      />
      <motion.div
        initial={{ y: "100%"}}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[420px] z-[9999] bg-card rounded-t-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary"
        >
          <X size={16} style={{ color: "#8B7E74" }} />
        </button>

        <h3 className="text-[20px] mb-1" style={{ color: "#5A5A5A" }}>
          Send Care Package
        </h3>
        <p className="text-[13px] mb-6" style={{ color: "#A39B94" }}>
          To: {recipient?.name}
        </p>

        <div className="mb-6">
          <label className="block text-[13px] mb-3" style={{ color: "#5A5A5A" }}>Select conceptual items</label>
          <div className="grid grid-cols-3 gap-2">
            {giftItems.map((item) => {
              const Icon = getItemIcon(item.type);
              const isSelected = selectedItems.find((i) => i.id === item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`w-full aspect-[3/2] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all p-1.5 ${
                    isSelected 
                      ? "border-primary bg-secondary" 
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-center w-full flex-1 min-h-0">
                    <Icon size={26} strokeWidth={1.5} style={{ color: "#8B7E74" }} />
                  </div>
                  <span className="text-[11px] w-full text-center leading-tight shrink-0" style={{ color: "#5A5A5A" }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[13px] mb-2" style={{ color: "#5A5A5A" }}>
            Include a letter (optional)
          </label>
          <textarea
            value={letter}
            onChange={(e) => {
              const newWordCount = e.target.value.trim().split(/\s+/).filter(word => word.length > 0).length;
              if (newWordCount <= maxLetterWords) {
                setLetter(e.target.value);
              }
            }}
            placeholder="Express yourself within the character limit"
            className="w-full h-24 px-4 py-3 rounded-2xl bg-secondary border border-border resize-none text-[13px]"
            style={{ color: "#5A5A5A" }}
          />
          <p
            className="text-[11px] text-right mt-1"
            style={{ color: wordCount >= maxLetterWords ? "#E8A8A0" : "#A39B94" }}
          >
            {wordCount}/{maxLetterWords} words
          </p>
        </div>

        {selectedItems.length > 0 && (
          <button
            onClick={startPreview}
            className="w-full bg-secondary text-foreground border border-border rounded-full py-3 px-6 flex items-center justify-center gap-2 mb-3 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Eye size={18} />
            Preview Package
          </button>
        )}

        <button
          onClick={sendPackage}
          disabled={selectedItems.length === 0}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
        >
          <Send size={20} />
          Send Package
        </button>

        <p className="text-[10px] text-center italic" style={{ color: "#A39B94" }}>
          Expires in 24 hours if not opened
        </p>
      </motion.div>

      {/* Preview modal */}
      <AnimatePresence>
        {isPreviewing && (
          <>
            {/* Fullscreen preview - within mobile view */}
            <div
              className="fixed inset-0 bg-background"
              style={{ zIndex: 10001 }}
            >
              <AnimatePresence mode="wait">
                {previewState === "items" && selectedItems[previewItemIndex] && (
                  <motion.div
                    key={`preview-item-${previewItemIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <InteractiveGift item={selectedItems[previewItemIndex]} isPreview={true} />
                  </motion.div>
                )}
                
                {previewState === "letter" && letter.trim() && (
                  <motion.div
                    key="preview-letter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center px-8"
                  >
                    <motion.div
                      initial={{ scale: 0.9, rotateX: 90 }}
                      animate={{ scale: 1, rotateX: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="bg-secondary rounded-2xl p-8 max-w-sm w-full shadow-2xl"
                    >
                      <p className="text-[12px] mb-4" style={{ color: "#A39B94" }}>
                        Your message (Preview)
                      </p>
                      <p className="text-[15px] leading-relaxed italic" style={{ color: "#5A5A5A" }}>
                        "{letter}"
                      </p>
                      <p className="text-[11px] mt-4 text-right" style={{ color: "#A39B94" }}>
                        — You
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress indicator */}
              <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-[10002]">
                {selectedItems.map((_, index) => (
                  <div
                    key={`dot-${index}`}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: previewState === "items" && index === previewItemIndex ? "#8B7E74" : "#D4C8BE",
                    }}
                  />
                ))}
                {letter.trim() && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: previewState === "letter" ? "#8B7E74" : "#D4C8BE",
                    }}
                  />
                )}
              </div>

              {/* Navigation arrow button */}
              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none" style={{ zIndex: 99999 }}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextPreviewItem();
                  }}
                  className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors pointer-events-auto cursor-pointer"
                >
                  <ChevronRight size={24} style={{ color: "#8B7E74" }} />
                </motion.button>
              </div>

              {/* Close preview button */}
              <button
                onClick={closePreview}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-secondary shadow-lg z-[10002] border-2 border-border hover:bg-primary hover:border-primary transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                <X size={20} style={{ color: "#8B7E74" }} />
              </button>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}