import { useState } from "react";
import { friends, currentUser, carePackages } from "../data/mockData";
import { EmotionalBlob } from "./EmotionalBlob";
import { Friend } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, Clock } from "lucide-react";
import { CarePackageModal } from "./CarePackageModal";

export function MapView() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCarePackage, setShowCarePackage] = useState(false);
  const [packageToOpen, setPackageToOpen] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Calculate positions for friends on the map (pseudo-map layout)
  const getFriendPosition = (index: number, total: number) => {
    // Spread friends across a larger map area for dragging
    const positions = [
      { x: 15, y: 20 },
      { x: 75, y: 15 },
      { x: 45, y: 35 },
      { x: 85, y: 45 },
      { x: 25, y: 60 },
      { x: 65, y: 70 },
      { x: 90, y: 80 },
      { x: 30, y: 85 },
      { x: 10, y: 40 },
      { x: 55, y: 50 },
    ];
    
    return positions[index % positions.length];
  };

  const unopenedPackages = carePackages.filter((pkg) => !pkg.opened);
  
  const getPackageText = () => {
    if (unopenedPackages.length === 0) return { main: "", sub: "" };
    
    const sender = unopenedPackages[0].from.name;
    
    if (unopenedPackages.length === 1) {
      return {
        main: `${sender} sent you care`,
        sub: `Open before it expires`
      };
    } else {
      return {
        main: `${sender} and ${unopenedPackages.length - 1} other${unopenedPackages.length > 2 ? 's' : ''} sent care`,
        sub: `${unopenedPackages.length} packages waiting`
      };
    }
  };

  const packageText = getPackageText();

  return (
    <div className="h-full w-full relative overflow-hidden px-5">
      {/* Care packages notification */}
      {unopenedPackages.length > 0 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-5 left-5 right-5 z-20"
        >
          <button
            onClick={() => setPackageToOpen(unopenedPackages[0].id)}
            className="w-full bg-card rounded-2xl px-5 py-4 shadow-lg border border-border flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <Gift size={20} style={{ color: "#8B7E74" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px]" style={{ color: "#5A5A5A" }}>
                {packageText.main}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "#A39B94" }}>
                {packageText.sub}
              </p>
            </div>
            <div className="text-[11px] flex items-center gap-1" style={{ color: "#A39B94" }}>
              <Clock size={12} />
              <span>23h</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Map container */}
      <div className="absolute top-[114px] left-5 right-5 h-[456px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ backgroundColor: "#F2EDE4" }}>
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setScale(Math.min(scale + 0.2, 2))}
              className="w-10 h-10 bg-card rounded-full shadow-lg border border-border flex items-center justify-center"
              style={{ color: "#8B7E74" }}
            >
              <span className="text-[20px] leading-none">+</span>
            </button>
            <button
              onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
              className="w-10 h-10 bg-card rounded-full shadow-lg border border-border flex items-center justify-center"
              style={{ color: "#8B7E74" }}
            >
              <span className="text-[20px] leading-none">−</span>
            </button>
          </div>

          {/* Draggable map content */}
          <motion.div
            drag
            dragConstraints={{
              top: -200,
              left: -200,
              right: 200,
              bottom: 200,
            }}
            dragElastic={0.05}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-[800px] h-[800px] cursor-grab active:cursor-grabbing"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-400px",
              marginTop: "-400px",
              originX: 0.5,
              originY: 0.5,
            }}
          >
            {/* Simplified street map background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
              {/* Water/Park areas */}
              <ellipse cx="650" cy="180" rx="140" ry="100" fill="#D4E6E1" opacity="0.4" />
              <rect x="50" y="600" width="160" height="140" rx="16" fill="#E8F5E3" opacity="0.5" />
              <ellipse cx="200" cy="250" rx="100" ry="80" fill="#D4E6E1" opacity="0.3" />
              <rect x="550" y="550" width="180" height="180" rx="16" fill="#E8F5E3" opacity="0.4" />
              
              {/* Major streets */}
              <line x1="0" y1="280" x2="800" y2="280" stroke="#C8BFB0" strokeWidth="12" opacity="0.6" />
              <line x1="0" y1="520" x2="800" y2="520" stroke="#C8BFB0" strokeWidth="12" opacity="0.6" />
              <line x1="240" y1="0" x2="240" y2="800" stroke="#C8BFB0" strokeWidth="12" opacity="0.6" />
              <line x1="560" y1="0" x2="560" y2="800" stroke="#C8BFB0" strokeWidth="12" opacity="0.6" />
              
              {/* Minor streets - horizontal */}
              <line x1="0" y1="140" x2="800" y2="140" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="0" y1="400" x2="800" y2="400" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="0" y1="640" x2="800" y2="640" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#D9D2C5" strokeWidth="5" opacity="0.4" />
              <line x1="0" y1="700" x2="800" y2="700" stroke="#D9D2C5" strokeWidth="5" opacity="0.4" />
              
              {/* Minor streets - vertical */}
              <line x1="120" y1="0" x2="120" y2="800" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="400" y1="0" x2="400" y2="800" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="680" y1="0" x2="680" y2="800" stroke="#D9D2C5" strokeWidth="6" opacity="0.5" />
              <line x1="80" y1="0" x2="80" y2="800" stroke="#D9D2C5" strokeWidth="5" opacity="0.4" />
              <line x1="720" y1="0" x2="720" y2="800" stroke="#D9D2C5" strokeWidth="5" opacity="0.4" />
              
              {/* Curved/diagonal streets for realism */}
              <path d="M 0 180 Q 280 220, 560 180 T 800 220" stroke="#D9D2C5" strokeWidth="6" fill="none" opacity="0.4" />
              <path d="M 350 0 Q 370 280, 420 560 T 460 800" stroke="#D9D2C5" strokeWidth="6" fill="none" opacity="0.4" />
              <path d="M 0 450 Q 200 480, 400 450 T 800 480" stroke="#D9D2C5" strokeWidth="5" fill="none" opacity="0.35" />
              
              {/* Building blocks (subtle rectangles) */}
              <rect x="260" y="300" width="280" height="200" fill="#E8DFD4" opacity="0.3" rx="8" />
              <rect x="260" y="20" width="280" height="240" fill="#E8DFD4" opacity="0.3" rx="8" />
              <rect x="580" y="300" width="180" height="200" fill="#E8DFD4" opacity="0.3" rx="8" />
              <rect x="20" y="300" width="200" height="200" fill="#E8DFD4" opacity="0.3" rx="8" />
              <rect x="20" y="20" width="200" height="240" fill="#E8DFD4" opacity="0.25" rx="8" />
              <rect x="260" y="540" width="120" height="140" fill="#E8DFD4" opacity="0.3" rx="8" />
              <rect x="420" y="540" width="120" height="140" fill="#E8DFD4" opacity="0.3" rx="8" />
            </svg>

            {/* Current user in center */}
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <EmotionalBlob emotion={currentUser.emotion} size={70} />
                <div className="bg-card px-3 py-1 rounded-full shadow-sm">
                  <p className="text-[11px]" style={{ color: "#8B7E74" }}>
                    {currentUser.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Friends */}
            {friends.map((friend, index) => {
              const pos = getFriendPosition(index, friends.length);
              return (
                <button
                  key={friend.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFriend(friend);
                  }}
                  className="absolute z-10 pointer-events-auto"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <EmotionalBlob emotion={friend.emotion} size={56} />
                    <div className="bg-card px-2.5 py-0.5 rounded-full shadow-sm">
                      <p className="text-[10px]" style={{ color: "#A39B94" }}>
                        {friend.name}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Friend detail modal */}
      <AnimatePresence>
        {selectedFriend && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriend(null)}
              className="absolute inset-0 bg-black/20 z-30"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setSelectedFriend(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary"
              >
                <X size={16} style={{ color: "#8B7E74" }} />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <EmotionalBlob emotion={selectedFriend.emotion} size={70} />
                <div className="flex-1">
                  <h3 className="text-[20px] mb-1" style={{ color: "#5A5A5A" }}>
                    {selectedFriend.name}
                  </h3>
                  <p className="text-[13px] mb-2" style={{ color: "#A39B94" }}>
                    Feeling: {selectedFriend.emotion}
                  </p>
                  <p className="text-[13px] italic" style={{ color: "#8B7E74" }}>
                    "{selectedFriend.status}"
                  </p>
                </div>
              </div>

              <div className="bg-secondary rounded-2xl p-4 mb-4">
                <p className="text-[11px] mb-1" style={{ color: "#A39B94" }}>
                  Last emotional update
                </p>
                <p className="text-[13px]" style={{ color: "#5A5A5A" }}>
                  {Math.floor((Date.now() - selectedFriend.lastUpdated.getTime()) / 60000)} minutes ago
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCarePackage(true);
                  setSelectedFriend(null);
                }}
                className="w-full bg-primary text-primary-foreground rounded-full py-4 px-6"
              >
                Send care (it might help)
              </button>

              <p className="text-[10px] text-center mt-3" style={{ color: "#A39B94" }}>
                Your gesture will be quantified and delivered
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Care package modal */}
      {showCarePackage && (
        <CarePackageModal
          onClose={() => setShowCarePackage(false)}
          recipient={selectedFriend || friends[0]}
        />
      )}

      {/* Care package opening */}
      {packageToOpen && (
        <CarePackageModal
          onClose={() => setPackageToOpen(null)}
          packageToOpen={carePackages.find((p) => p.id === packageToOpen)}
        />
      )}
    </div>
  );
}