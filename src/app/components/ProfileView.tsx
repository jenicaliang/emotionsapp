import { useState } from "react";
import { currentUser, friends } from "../data/mockData";
import { EmotionalBlob } from "./EmotionalBlob";
import { Users, MapPin, Clock, LogOut, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { Emotion } from "../types";
import Frame5 from "../../imports/Frame5";
import Frame6 from "../../imports/Frame6";
import Frame7 from "../../imports/Frame7";
import Frame8 from "../../imports/Frame8";
import Frame9 from "../../imports/Frame9";
import Frame10 from "../../imports/Frame10";
import Frame11 from "../../imports/Frame11";

export function ProfileView() {
  const [showInvite, setShowInvite] = useState(false);
  const [showEmotions, setShowEmotions] = useState(false);

  const timeSinceUpdate = Math.floor((Date.now() - currentUser.lastUpdated.getTime()) / 60000);

  return (
    <div className="h-full w-full overflow-y-auto px-5 py-5">
      {/* Profile Header - Your Current Emotion */}
      <div className="flex flex-col items-center mb-8">
        <div className="mb-4">
          <EmotionalBlob emotion={currentUser.emotion} size={120} />
        </div>
        <h2 className="text-[28px] mb-2" style={{ color: "#5A5A5A" }}>
          You
        </h2>
        <p className="text-[14px] italic mb-3 text-center max-w-[280px]" style={{ color: "#8B7E74" }}>
          "{currentUser.status}"
        </p>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "#A39B94" }}>
          <Clock size={16} />
          <span>Last felt {timeSinceUpdate} minutes ago</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} style={{ color: "#A39B94" }} />
            <p className="text-[12px]" style={{ color: "#A39B94" }}>
              Emotional Network
            </p>
          </div>
          <p className="text-[32px] mb-1" style={{ color: "#5A5A5A" }}>
            {friends.length}
          </p>
          <p className="text-[11px]" style={{ color: "#A39B94" }}>
            friends being monitored
          </p>
        </div>

        <div className="bg-secondary rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} style={{ color: "#A39B94" }} />
            <p className="text-[12px]" style={{ color: "#A39B94" }}>
              Location Data
            </p>
          </div>
          <p className="text-[32px] mb-1" style={{ color: "#5A5A5A" }}>
            24/7
          </p>
          <p className="text-[11px]" style={{ color: "#A39B94" }}>
            real-time tracking
          </p>
        </div>
      </div>

      {/* About Candid */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h3 className="text-[16px] mb-4" style={{ color: "#5A5A5A" }}>
          About Candid
        </h3>
        
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#A39B94" }}>
          Candid uses machine learning to detect your emotions and share them with your closest friends. Because sometimes, you need an algorithm to tell you how you feel.
        </p>
        <p className="text-[12px] italic" style={{ color: "#8B7E74" }}>
          "We understand you better than you understand yourself."
        </p>
      </div>

      {/* Emotion Guide - Expandable */}
      <div className="bg-card border border-border rounded-2xl mb-6 overflow-hidden">
        <button
          onClick={() => setShowEmotions(!showEmotions)}
          className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        >
          <h3 className="text-[16px]" style={{ color: "#5A5A5A" }}>
            Understanding Your Emotions
          </h3>
          {showEmotions ? (
            <ChevronUp size={20} style={{ color: "#A39B94" }} />
          ) : (
            <ChevronDown size={20} style={{ color: "#A39B94" }} />
          )}
        </button>
        
        {showEmotions && (
          <div className="px-5 pb-5 space-y-4">
            <p className="text-[11px] mb-4" style={{ color: "#A39B94" }}>
              Our algorithm analyzes your facial expressions to assign you one of seven emotional states:
            </p>
            
            {[
              { emotion: "Happiness" as Emotion, reason: "Detected smile, raised cheeks, and relaxed posture. You're experiencing joy—or at least our ML thinks you are." },
              { emotion: "Sadness" as Emotion, reason: "Downturned mouth, furrowed brow, low energy detected. We've identified that you might need checking in on." },
              { emotion: "Anger" as Emotion, reason: "Tensed jaw, narrowed eyes, elevated heart rate. The algorithm suggests you're experiencing frustration or rage." },
              { emotion: "Fear" as Emotion, reason: "Wide eyes, raised eyebrows, possible trembling. Our system believes you're anxious or startled." },
              { emotion: "Disgust" as Emotion, reason: "Wrinkled nose, curled upper lip. You're repulsed by something—we're just reporting what we see." },
              { emotion: "Surprise" as Emotion, reason: "Raised eyebrows, open mouth, widened eyes. Something unexpected happened and our AI caught it." },
              { emotion: "Neutral" as Emotion, reason: "No strong expression detected. You're either calm, or successfully hiding from our algorithms." },
            ].map((item) => (
              <div key={item.emotion} className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <EmotionalBlob emotion={item.emotion} size={36} animate={false} />
                  <h4 className="text-[14px]" style={{ color: "#5A5A5A" }}>
                    {item.emotion}
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "#A39B94" }}>
                  {item.reason}
                </p>
              </div>
            ))}
            
            <p className="text-[10px] italic pt-2" style={{ color: "#8B7E74" }}>
              Remember: Emotions are complex and personal. Our algorithm provides interpretations, not absolute truths.
            </p>
          </div>
        )}
      </div>

      {/* Your Emotional Circle - Separate Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px]" style={{ color: "#5A5A5A" }}>
            Your Emotional Circle
          </h3>
          <button
            onClick={() => setShowInvite(true)}
            className="text-[12px] flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/70 transition-all active:scale-95"
            style={{ color: "#8B7E74" }}
          >
            <UserPlus size={14} />
            Invite
          </button>
        </div>

        <div className="space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-secondary rounded-2xl p-4 flex items-center gap-3"
            >
              <EmotionalBlob emotion={friend.emotion} size={48} />
              <div className="flex-1">
                <p className="text-[14px] mb-0.5" style={{ color: "#5A5A5A" }}>
                  {friend.name}
                </p>
                <p className="text-[11px]" style={{ color: "#A39B94" }}>
                  {friend.emotion} · {Math.floor((Date.now() - friend.lastUpdated.getTime()) / 60000)}m ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-secondary rounded-2xl p-5 mb-6">
        <h3 className="text-[14px] mb-2" style={{ color: "#5A5A5A" }}>
          Privacy & Data Collection
        </h3>
        <p className="text-[11px] leading-relaxed" style={{ color: "#A39B94" }}>
          We collect your video data, location, emotional patterns, and social connections to provide our service. Your data is processed by our machine learning algorithms and shared with your friends. By using Candid, you agree that authentic human connection requires surveillance.
        </p>
      </div>

      {/* Logout */}
      <button className="w-full bg-destructive/20 text-destructive rounded-full py-3 px-6 flex items-center justify-center gap-2 mb-8 hover:bg-destructive/30 transition-all active:scale-95">
        <LogOut size={18} />
        Disconnect from the Network
      </button>

      {/* Invite Modal */}
      {showInvite && (
        <>
          <div
            onClick={() => setShowInvite(false)}
            className="absolute inset-0 bg-black/30 z-50"
          />
          <div className="absolute inset-5 z-50 bg-card rounded-2xl p-5 shadow-2xl flex flex-col mx-auto my-auto h-fit">
            <h3 className="text-[20px] mb-2" style={{ color: "#5A5A5A" }}>
              Invite Someone
            </h3>
            <p className="text-[13px] mb-6" style={{ color: "#A39B94" }}>
              Share the surveillance with someone you care about
            </p>

            <div className="bg-secondary rounded-2xl p-4 mb-6">
              <p className="text-[11px] mb-2" style={{ color: "#A39B94" }}>
                Your invite code
              </p>
              <p
                className="text-[20px] tracking-wider text-center py-2"
                style={{ color: "#8B7E74" }}
              >
                FEEL-4782
              </p>
            </div>

            <button
              onClick={() => setShowInvite(false)}
              className="w-full bg-primary text-primary-foreground rounded-full py-4 px-6"
            >
              Done
            </button>

            <p className="text-[10px] text-center mt-3 italic" style={{ color: "#A39B94" }}>
              Limited to 50 friends for optimal emotional tracking
            </p>
          </div>
        </>
      )}
    </div>
  );
}