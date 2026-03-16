import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet.css";
import { friends, currentUser as defaultCurrentUser, carePackages } from "../data/mockData";
import { useCurrentUser } from "../context/CurrentUserContext";
import { EmotionalBlob } from "./EmotionalBlob";
import { Friend } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Gift, Clock, MapPin } from "lucide-react";
import { CarePackageModal } from "./CarePackageModal";

const DEFAULT_CENTER: [number, number] = [defaultCurrentUser.location.lat, defaultCurrentUser.location.lng];
const DEFAULT_ZOOM = 15;

const FRIEND_RADIUS_MILES = 2;

/** Returns random [dLat, dLng] offsets within radiusMiles of center (uniform in disk). New positions each load. */
function generateRandomOffsetsInRadius(
  center: { lat: number; lng: number },
  count: number,
  radiusMiles: number
): [number, number][] {
  const degPerMileLat = 1 / 69;
  const degPerMileLng = 1 / (69 * Math.cos((center.lat * Math.PI) / 180));
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r = radiusMiles * Math.sqrt(Math.random());
    out.push([
      r * Math.cos(angle) * degPerMileLat,
      r * Math.sin(angle) * degPerMileLng,
    ]);
  }
  return out;
}

/** Overlay that renders EmotionalBlob (real faces) at lat/lng; positions update every frame during pan/zoom for fluid movement */
function MapBlobOverlay({
  people,
  onSelect,
}: {
  people: (Friend & { id: string })[];
  onSelect: (f: Friend) => void;
}) {
  const map = useMap();
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);
  const peopleRef = useRef(people);
  peopleRef.current = people;

  useEffect(() => {
    const update = () => {
      const list = peopleRef.current;
      const next: Record<string, { x: number; y: number }> = {};
      list.forEach((p) => {
        const pt = map.latLngToContainerPoint([p.location.lat, p.location.lng]);
        next[p.id] = { x: pt.x, y: pt.y };
      });
      setPositions(next);
    };

    const startFluidUpdate = () => {
      const tick = () => {
        update();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopFluidUpdate = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      update();
    };

    update();
    map.on("movestart", startFluidUpdate);
    map.on("zoomstart", startFluidUpdate);
    map.on("moveend", stopFluidUpdate);
    map.on("zoomend", stopFluidUpdate);
    map.on("viewreset", update);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      map.off("movestart", startFluidUpdate);
      map.off("zoomstart", startFluidUpdate);
      map.off("moveend", stopFluidUpdate);
      map.off("zoomend", stopFluidUpdate);
      map.off("viewreset", update);
    };
  }, [map]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1000]" aria-hidden>
      {people.map((p) => {
        const pos = positions[p.id];
        if (pos == null) return null;
        const isUser = p.id === defaultCurrentUser.id;
        const size = isUser ? 70 : 56;
        const half = size / 2;
        const labelH = 24;
        return (
          <button
            key={p.id}
            type="button"
            className="absolute flex flex-col items-center gap-1.5 pointer-events-auto transition-transform active:scale-95"
            style={{
              left: pos.x - half,
              top: pos.y - half - labelH,
            }}
            onClick={() => onSelect(p)}
          >
            <EmotionalBlob emotion={p.emotion} size={size} />
            <div className="bg-card px-2.5 py-0.5 rounded-full shadow-sm">
              <p className="text-[10px]" style={{ color: "#A39B94" }}>
                {p.name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** When user location is available, center the map on it */
function MapCenterToUser({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], map.getZoom(), { duration: 0.8 });
    }
  }, [map, userLocation?.lat, userLocation?.lng]);
  return null;
}

export function MapView() {
  const { currentUser } = useCurrentUser();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCarePackage, setShowCarePackage] = useState(false);
  const [packageToOpen, setPackageToOpen] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied" | "unavailable">("idle");

  // Ask for user's location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [currentUser.location.lat, currentUser.location.lng];
  const userForMap: Friend & { id: string } = userLocation
    ? { ...currentUser, location: userLocation }
    : currentUser;

  // Random offsets within 2-mile radius, generated once per load so positions differ each visit
  const [friendOffsets] = useState<[number, number][]>(() =>
    generateRandomOffsetsInRadius(defaultCurrentUser.location, friends.length, FRIEND_RADIUS_MILES)
  );

  const userCenter = userForMap.location;
  const friendsNearUser: (Friend & { id: string })[] = friends.map((friend, i) => {
    const [dLat, dLng] = friendOffsets[i] ?? [0, 0];
    return {
      ...friend,
      location: {
        lat: userCenter.lat + dLat,
        lng: userCenter.lng + dLng,
      },
    };
  });

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
          className="absolute top-2 left-5 right-5 z-20"
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

      {/* Location status — only show when loading or when we fell back to default */}
      {locationStatus === "loading" && (
        <div className="absolute top-[56px] left-5 right-5 z-10 flex justify-center">
          <p className="text-[12px] px-3 py-1.5 rounded-full bg-card/95 shadow border border-border" style={{ color: "#6B6B6B" }}>
            Getting your location…
          </p>
        </div>
      )}
      {locationStatus === "denied" && (
        <div className="absolute top-[52px] left-5 right-5 z-10 flex justify-center">
          <p className="text-[11px] px-3 py-1.5 rounded-full bg-card/95 shadow border border-border" style={{ color: "#8B7E74" }}>
            Location unavailable — showing default area
          </p>
        </div>
      )}
      {locationStatus === "unavailable" && (
        <div className="absolute top-[52px] left-5 right-5 z-10 flex justify-center">
          <p className="text-[11px] px-3 py-1.5 rounded-full bg-card/95 shadow border border-border" style={{ color: "#8B7E74" }}>
            Geolocation not supported — showing default area
          </p>
        </div>
      )}

      {/* Map container — OpenStreetMap via Leaflet */}
      <div className="absolute top-[98px] left-5 right-5 bottom-6">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full rounded-2xl"
            style={{ minHeight: 280 }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterToUser userLocation={userLocation} />
            {/* Emotional blob faces (real avatars) overlaid at lat/lng; move with map on pan/zoom */}
            <MapBlobOverlay
              people={[userForMap, ...friendsNearUser]}
              onSelect={setSelectedFriend}
            />
          </MapContainer>
        </div>
        {/* Hint tooltip: floats up 0.5s after homepage shows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg border border-border"
          style={{ color: "#5A5A5A" }}
        >
          <MapPin size={18} className="shrink-0" style={{ color: "#6B6B6B" }} />
          <span className="text-[13px] font-medium whitespace-nowrap">
            Click on a friend to send them some care.
          </span>
        </motion.div>
      </div>

      {/* Friend detail popup — top level above map and everything */}
      <AnimatePresence>
        {selectedFriend && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriend(null)}
              className="fixed inset-0 bg-black/20 z-[9998]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] bg-card rounded-t-2xl p-6 shadow-2xl max-w-[430px] mx-auto"
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