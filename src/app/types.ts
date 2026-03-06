export type Emotion = 
  | "Unknown"
  | "Happy" 
  | "Sad" 
  | "Neutral" 
  | "Angry" 
  | "Surprise" 
  | "Disgust" 
  | "Fear" 
  | "Contempt";

export interface Friend {
  id: string;
  name: string;
  emotion: Emotion;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  lastUpdated: Date;
  canUpdate: boolean;
  cooldownEnds?: Date;
}

export interface CarePackageItem {
  id: string;
  type: "flowers" | "balloon" | "hug" | "tea" | "star" | "heart";
  label: string;
}

export interface CarePackage {
  id: string;
  from: Friend;
  items: CarePackageItem[];
  letter: string;
  sentAt: Date;
  expiresAt: Date;
  opened: boolean;
}
