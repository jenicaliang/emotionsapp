import { Friend, CarePackage, Emotion } from "../types";

export const currentUser: Friend = {
  id: "user-1",
  name: "You",
  emotion: "Neutral",
  status: "Existing in the digital ether",
  location: { lat: 40.7580, lng: -73.9855 },
  lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
  canUpdate: true,
};

export const friends: Friend[] = [
  {
    id: "friend-1",
    name: "Alex",
    emotion: "Happy",
    status: "The algorithm says I'm thriving",
    location: { lat: 40.7489, lng: -73.9680 },
    lastUpdated: new Date(Date.now() - 1800000), // 30 min ago
    canUpdate: false,
    cooldownEnds: new Date(Date.now() + 5400000), // 1.5 hours from now
  },
  {
    id: "friend-2",
    name: "Jordan",
    emotion: "Sad",
    status: "Validated by machine learning",
    location: { lat: 40.7614, lng: -73.9776 },
    lastUpdated: new Date(Date.now() - 900000), // 15 min ago
    canUpdate: false,
  },
  {
    id: "friend-3",
    name: "Sam",
    emotion: "Surprise",
    status: "The AI understands me now",
    location: { lat: 40.7549, lng: -73.9840 },
    lastUpdated: new Date(Date.now() - 2700000), // 45 min ago
    canUpdate: false,
  },
  {
    id: "friend-4",
    name: "Riley",
    emotion: "Fear",
    status: "Quantified and categorized",
    location: { lat: 40.7505, lng: -73.9934 },
    lastUpdated: new Date(Date.now() - 600000), // 10 min ago
    canUpdate: false,
  },
];

export const carePackages: CarePackage[] = [
  {
    id: "package-1",
    from: friends[0],
    items: [
      { id: "item-1", type: "flowers", label: "Digital Flowers" },
      { id: "item-2", type: "hug", label: "Virtual Hug" },
    ],
    letter: "The app suggested I send this. Hope you're doing well, or at least the algorithm thinks you should be.",
    sentAt: new Date(Date.now() - 43200000), // 12 hours ago
    expiresAt: new Date(Date.now() + 43200000), // 12 hours from now
    opened: false,
  },
];

// 7 classes matching model output (no Unknown). Keys used by UI from model labels.
export const emotionColors: Record<string, string> = {
  Happy: "#FFD580",
  Sad: "#8CB8FF",
  Neutral: "#D4C4B4",
  Angry: "#FFB8B8",
  Surprise: "#FFBE80",
  Disgust: "#8CFFC4",
  Fear: "#C89FFF",
};

export const emotionFaces: Record<string, string> = {
  Happy: "◡‿◡",
  Sad: "︵﹏︵",
  Neutral: "•_•",
  Angry: "ಠ_ಠ",
  Surprise: "◉_◉",
  Disgust: "ಠ~ಠ",
  Fear: "⊙﹏⊙",
};

export const loadingMessages = [
  "We've seen this before",
  "Quantifying your humanity",
  "Teaching machines to feel for you",
  "Your emotions are being processed",
  "Calculating genuine sentiment",
  "Converting feelings to data points",
  "We understand you now",
  "Validating your emotional state",
];

export const cooldownMessages = [
  "You're not ready to feel again",
  "The algorithm needs time to process",
  "Emotions require a cooldown period",
  "Please wait until you can feel authentically",
  "Your next feeling is scheduled",
];
