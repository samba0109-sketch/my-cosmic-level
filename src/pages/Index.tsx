import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav, { type TabKey } from "@/components/BottomNav";
import DashboardScreen from "@/components/screens/DashboardScreen";
import RecordsScreen from "@/components/screens/RecordsScreen";
import CheckinScreen from "@/components/screens/CheckinScreen";
import PlanetScreen from "@/components/screens/PlanetScreen";
import CrewScreen from "@/components/screens/CrewScreen";

const SUBTITLES: Record<TabKey, string> = {
  dashboard: "EARTH 01",
  records: "LOG ARCHIVE",
  checkin: "MISSION SYNC",
  planet: "PLANET VIEW",
  crew: "FLEET",
};

const Index = () => {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <main className="min-h-dvh bg-background">
      <div className="toss-frame shadow-card">
        {/* Ambient stars layer */}
        <div className="pointer-events-none absolute inset-0 stars opacity-60" aria-hidden />
        <div className="relative">
          <AppHeader subtitle={SUBTITLES[tab]} />
          {tab === "dashboard" && (
            <DashboardScreen onStart={() => setTab("checkin")} onOpenRecords={() => setTab("records")} />
          )}
          {tab === "records" && <RecordsScreen />}
          {tab === "checkin" && <CheckinScreen />}
          {tab === "planet" && <PlanetScreen onAddRecord={() => setTab("checkin")} />}
          {tab === "crew" && <CrewScreen />}
          <BottomNav active={tab} onChange={setTab} />
        </div>
      </div>
    </main>
  );
};

export default Index;
