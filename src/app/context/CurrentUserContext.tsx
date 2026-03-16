import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Friend } from "../types";
import { currentUser as initialCurrentUser } from "../data/mockData";

type BroadcastEmotion = string;

interface CurrentUserContextValue {
  currentUser: Friend;
  setBroadcast: (emotion: BroadcastEmotion, status: string) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Friend>(() => ({ ...initialCurrentUser }));

  const setBroadcast = useCallback((emotion: BroadcastEmotion, status: string) => {
    setUser((prev) => ({
      ...prev,
      emotion: emotion as Friend["emotion"],
      status: status.trim() || prev.status,
      lastUpdated: new Date(),
    }));
  }, []);

  return (
    <CurrentUserContext.Provider value={{ currentUser: user, setBroadcast }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}
