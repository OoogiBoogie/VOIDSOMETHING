/**
 * PHASE 5 — HUD EVENT INTEGRATION EXAMPLE
 * 
 * This file demonstrates how to wire world events into HUD components.
 * Copy these patterns into your actual HUD files.
 */

import { useEffect } from "react";
import { 
  worldEventBus, 
  useWorldEvent,
  WorldEventType,
  handleDistrictEntered,
  handleFirstParcelVisit,
  type ParcelEnteredEvent,
  type DistrictEnteredEvent,
} from "@/world/worldEvents";

// ============================================
// EXAMPLE 1: Toast Notifications
// ============================================

export function WorldNotificationListener() {
  // Auto-show toasts on district change
  useWorldEvent(WorldEventType.DISTRICT_ENTERED, handleDistrictEntered);
  
  // Auto-show XP rewards on first parcel visit
  useWorldEvent(WorldEventType.FIRST_PARCEL_VISIT, handleFirstParcelVisit);
  
  return null; // Invisible component, just listens
}

// ============================================
// EXAMPLE 2: Mini Map Highlighting
// ============================================

export function MiniMapPanel() {
  const [currentParcelId, setCurrentParcelId] = useState<string | null>(null);
  
  useWorldEvent(WorldEventType.PARCEL_ENTERED, (event) => {
    setCurrentParcelId(event.parcelId);
    // Highlight parcel on map canvas
    highlightParcelOnMap(event.parcelId);
  });
  
  return (
    <div className="mini-map">
      <Canvas>
        {/* Render map with highlighted parcel */}
      </Canvas>
      {currentParcelId && (
        <div className="current-parcel">Parcel #{currentParcelId}</div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 3: District Label Updates
// ============================================

export function DistrictLabel() {
  const [district, setDistrict] = useState<string>("Unknown");
  
  useWorldEvent(WorldEventType.DISTRICT_ENTERED, (event) => {
    setDistrict(event.districtName);
  });
  
  return (
    <div className="district-label">
      <span className="text-cyan-400">District:</span> {district}
    </div>
  );
}

// ============================================
// EXAMPLE 4: Exploration Progress Tracker
// ============================================

export function ExplorationStats() {
  const [stats, setStats] = useState({
    parcelsVisited: 0,
    districtsVisited: 0,
    totalXP: 0,
  });
  
  useEffect(() => {
    const unsubParcel = worldEventBus.on(
      WorldEventType.FIRST_PARCEL_VISIT,
      (event) => {
        setStats(prev => ({
          ...prev,
          parcelsVisited: prev.parcelsVisited + 1,
          totalXP: prev.totalXP + event.xpAwarded,
        }));
      }
    );
    
    const unsubDistrict = worldEventBus.on(
      WorldEventType.FIRST_DISTRICT_VISIT,
      (event) => {
        setStats(prev => ({
          ...prev,
          districtsVisited: prev.districtsVisited + 1,
          totalXP: prev.totalXP + event.xpAwarded,
        }));
      }
    );
    
    return () => {
      unsubParcel();
      unsubDistrict();
    };
  }, []);
  
  return (
    <div className="exploration-stats">
      <div>Parcels: {stats.parcelsVisited} / 1600</div>
      <div>Districts: {stats.districtsVisited} / 5</div>
      <div>XP: {stats.totalXP}</div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Real-time Activity Feed
// ============================================

export function ActivityFeed() {
  const [activities, setActivities] = useState<string[]>([]);
  
  useEffect(() => {
    // Listen to all events
    const unsub1 = worldEventBus.on(WorldEventType.PARCEL_ENTERED, (event) => {
      addActivity(`Entered Parcel #${event.parcelId}`);
    });
    
    const unsub2 = worldEventBus.on(WorldEventType.DISTRICT_ENTERED, (event) => {
      addActivity(`Entered ${event.districtName} District`);
    });
    
    function addActivity(message: string) {
      setActivities(prev => [
        `${new Date().toLocaleTimeString()}: ${message}`,
        ...prev.slice(0, 9) // Keep last 10
      ]);
    }
    
    return () => {
      unsub1();
      unsub2();
    };
  }, []);
  
  return (
    <div className="activity-feed">
      {activities.map((activity, i) => (
        <div key={i} className="activity-item">{activity}</div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Session Timer
// ============================================

export function SessionTimer() {
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const unsubStart = worldEventBus.on(WorldEventType.SESSION_STARTED, (event) => {
      setSessionStart(event.timestamp);
    });
    
    const unsubEnd = worldEventBus.on(WorldEventType.SESSION_ENDED, (event) => {
      setSessionStart(null);
    });
    
    return () => {
      unsubStart();
      unsubEnd();
    };
  }, []);
  
  useEffect(() => {
    if (!sessionStart) return;
    
    const interval = setInterval(() => {
      setElapsed(Date.now() - sessionStart);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionStart]);
  
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  return (
    <div className="session-timer">
      Session: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}

// ============================================
// USAGE IN MAIN HUD
// ============================================

// In VoidHudApp.tsx or similar:
export function VoidHudApp() {
  return (
    <>
      {/* Invisible event listeners */}
      <WorldNotificationListener />
      
      {/* Visible HUD components that react to events */}
      <DistrictLabel />
      <MiniMapPanel />
      <ExplorationStats />
      <ActivityFeed />
      <SessionTimer />
    </>
  );
}
