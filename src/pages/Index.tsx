import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav, { type TabKey } from "@/components/BottomNav";
import DashboardScreen from "@/components/screens/DashboardScreen";
import RecordsScreen from "@/components/screens/RecordsScreen";
import CheckinScreen from "@/components/screens/CheckinScreen";
import PlanetScreen from "@/components/screens/PlanetScreen";
import CrewScreen from "@/components/screens/CrewScreen";

const Index = () => {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <main className="min-h-dvh bg-surface-2">
      <div className="toss-frame shadow-card">
        <AppHeader subtitle="Planet Exploration" />
        {tab === "dashboard" && (
          <DashboardScreen onStart={() => setTab("checkin")} onOpenRecords={() => setTab("records")} />
        )}
        {tab === "records" && <RecordsScreen />}
        {tab === "checkin" && <CheckinScreen />}
        {tab === "planet" && <PlanetScreen onAddRecord={() => setTab("checkin")} />}
        {tab === "crew" && <CrewScreen />}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </main>
  );
};

export default Index;
