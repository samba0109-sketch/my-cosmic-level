import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav, { type TabKey } from "@/components/BottomNav";
import IntroScreen from "@/components/screens/IntroScreen";
import DashboardScreen from "@/components/screens/DashboardScreen";
import RecordsScreen, { type RecordsView } from "@/components/screens/RecordsScreen";
import CheckinScreen from "@/components/screens/CheckinScreen";
import PlanetScreen from "@/components/screens/PlanetScreen";
import CrewScreen from "@/components/screens/CrewScreen";

interface RecordsInit {
  view?: RecordsView;
  city?: string;
}

const Index = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [recordsInit, setRecordsInit] = useState<RecordsInit | undefined>();

  const openRecords = (opts?: RecordsInit) => {
    setRecordsInit(opts);
    setTab("records");
  };

  const handleStart = () => {
    setHasStarted(true);
    setTab("checkin");
  };

  if (!hasStarted) {
    return (
      <main className="min-h-dvh bg-surface-2">
        <div className="toss-frame shadow-card">
          <IntroScreen onStart={handleStart} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-surface-2">
      <div className="toss-frame shadow-card">
        <AppHeader subtitle="Planet Exploration" />
        {tab === "dashboard" && (
          <DashboardScreen onStart={() => setTab("checkin")} onOpenRecords={openRecords} />
        )}
        {tab === "records" && <RecordsScreen initialView={recordsInit?.view} initialCity={recordsInit?.city} />}
        {tab === "checkin" && <CheckinScreen />}
        {tab === "planet" && <PlanetScreen onAddRecord={() => setTab("checkin")} />}
        {tab === "crew" && <CrewScreen />}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </main>
  );
};

export default Index;
