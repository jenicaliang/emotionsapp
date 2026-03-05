import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flower2, Heart, Coffee, Star, CircleDot, Send } from "lucide-react";
import { Friend, CarePackage, CarePackageItem } from "../types";
import { toast } from "sonner";

interface CarePackageModalProps {
  onClose: () => void;
  recipient?: Friend;
  packageToOpen?: CarePackage;
}

const giftItems: CarePackageItem[] = [
  { id: "flowers", type: "flowers", label: "Digital Flowers" },
  { id: "balloon", type: "balloon", label: "Imaginary Balloon" },
  { id: "hug", type: "hug", label: "Virtual Hug" },
  { id: "tea", type: "tea", label: "Conceptual Tea" },
  { id: "star", type: "star", label: "Symbolic Star" },
  { id: "heart", type: "heart", label: "Abstract Heart" },
];

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
    case "hug":
    case "balloon":
      return CircleDot;
    default:
      return CircleDot;
  }
};

export function CarePackageModal({
  onClose,
  recipient,
  packageToOpen,
}: CarePackageModalProps) {
  const [selectedItems, setSelectedItems] = useState<CarePackageItem[]>([]);
  const [letter, setLetter] = useState("");
  const [openingState, setOpeningState] = useState<"sealed" | "peeling" | "opened" | "thanked">(
    packageToOpen ? "sealed" : "composing"
  );
  const [animatingItems, setAnimatingItems] = useState(false);

  const maxLetterWords = 50;
  const wordCount = letter.trim().split(/\s+/).filter(word => word.length > 0).length;

  const toggleItem = (item: CarePackageItem) => {
    setSelectedItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const sendPackage = () => {
    // In real app, would send to backend
    toast("Care package dispatched", {
      description: "Your emotional gesture has been algorithmically optimized and sent.",
    });
    onClose();
  };

  const startOpening = () => {
    setOpeningState("peeling");
    setTimeout(() => {
      setOpeningState("opened");
      setAnimatingItems(true);
      setTimeout(() => setAnimatingItems(false), 2000);
    }, 2000);
  };

  const sendThanks = () => {
    setOpeningState("thanked");
    setTimeout(() => onClose(), 1500);
  };

  // Rendering for opening a received package
  if (packageToOpen) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-5 z-50 bg-card rounded-2xl p-5 shadow-2xl flex flex-col mx-auto my-auto h-fit max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary z-10"
          >
            <X size={16} style={{ color: "#8B7E74" }} />
          </button>

          <AnimatePresence mode="wait">
            {openingState === "sealed" && (
              <motion.div
                key="sealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8"
              >
                <h3 className="text-[20px] mb-2" style={{ color: "#5A5A5A" }}>
                  Care Package from {packageToOpen.from.name}
                </h3>
                <p className="text-[11px] mb-8" style={{ color: "#A39B94" }}>
                  Expires in 23 hours
                </p>

                {/* Cardboard box illustration */}
                <motion.div
                  className="relative w-48 h-48 mb-8"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Box */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-dashed"
                    style={{
                      backgroundColor: "#D4C8BE",
                      borderColor: "#8B7E74",
                    }}
                  />

                  {/* Tape strips */}
                  <div
                    className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.8 }}
                  />
                  <div
                    className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.8 }}
                  />

                  {/* Sealed label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card px-4 py-2 rounded-full shadow-sm">
                      <p className="text-[11px]" style={{ color: "#8B7E74" }}>
                        Tap to open
                      </p>
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={startOpening}
                  className="w-full bg-primary text-primary-foreground rounded-full py-4 px-6"
                >
                  Peel the tape
                </button>

                <p className="text-[10px] text-center mt-4 italic" style={{ color: "#A39B94" }}>
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
                className="flex flex-col items-center py-12"
              >
                <motion.div
                  className="relative w-48 h-48"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {/* Box with peeling tape */}
                  <div
                    className="absolute inset-0 rounded-3xl border-2 border-dashed"
                    style={{
                      backgroundColor: "#D4C8BE",
                      borderColor: "#8B7E74",
                    }}
                  />

                  <motion.div
                    className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 origin-top"
                    style={{ backgroundColor: "#F5EFE7", opacity: 0.8 }}
                    animate={{
                      scaleY: [1, 0.5, 0],
                      opacity: [0.8, 0.5, 0],
                    }}
                    transition={{ duration: 2 }}
                  />
                </motion.div>

                <p className="text-[13px] mt-8" style={{ color: "#A39B94" }}>
                  Unsealing your emotions...
                </p>
              </motion.div>
            )}

            {openingState === "opened" && (
              <motion.div
                key="opened"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col py-4"
              >
                <h3 className="text-[20px] mb-1" style={{ color: "#5A5A5A" }}>
                  From {packageToOpen.from.name}
                </h3>
                <p className="text-[11px] mb-6" style={{ color: "#A39B94" }}>
                  Sent with algorithmic care
                </p>

                {/* Items bursting forth */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {packageToOpen.items.map((item, index) => {
                    const Icon = getItemIcon(item.type);
                    return (
                      <motion.div
                        key={item.id}
                        initial={animatingItems ? { scale: 0, y: 100 } : { scale: 1, y: 0 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{
                          delay: index * 0.15,
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "#F5EFE7" }}
                        >
                          <Icon size={28} strokeWidth={1.5} style={{ color: "#8B7E74" }} />
                        </div>
                        <p className="text-[10px] text-center" style={{ color: "#A39B94" }}>
                          {item.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Letter */}
                {packageToOpen.letter && (
                  <div className="bg-secondary rounded-2xl p-4 mb-6">
                    <p className="text-[11px] mb-2" style={{ color: "#A39B94" }}>
                      A message (50 words max)
                    </p>
                    <p className="text-[13px] italic" style={{ color: "#5A5A5A" }}>
                      "{packageToOpen.letter}"
                    </p>
                  </div>
                )}

                {openingState !== "thanked" ? (
                  <>
                    <button
                      onClick={sendThanks}
                      className="w-full bg-primary text-primary-foreground rounded-full py-4 px-6"
                    >
                      Thanks!
                    </button>

                    <p className="text-[10px] text-center mt-3" style={{ color: "#A39B94" }}>
                      (This is your only response option)
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-[15px]" style={{ color: "#8B7E74" }}>
                      Your appreciation has been noted
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
        className="absolute inset-0 bg-black/30 z-50"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
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
          <label className="block text-[13px] mb-3" style={{ color: "#5A5A5A" }}>
            Select imaginary items
          </label>
          <div className="grid grid-cols-3 gap-3">
            {giftItems.map((item) => {
              const Icon = getItemIcon(item.type);
              const isSelected = selectedItems.find((i) => i.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    isSelected ? "border-primary bg-secondary" : "border-border bg-background"
                  }`}
                >
                  <Icon size={24} strokeWidth={1.5} style={{ color: "#8B7E74" }} />
                  <span className="text-[10px] text-center" style={{ color: "#5A5A5A" }}>
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
            placeholder="Express yourself within the character limit..."
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
    </>
  );
}