import { useState } from "react";
import TossHeader from "@/components/TossHeader";
import HomeScreen from "@/components/screens/HomeScreen";
import UploadScreen from "@/components/screens/UploadScreen";
import AnalyzingScreen from "@/components/screens/AnalyzingScreen";
import ResultScreen from "@/components/screens/ResultScreen";

type Step = "home" | "upload" | "analyzing" | "result";

const Index = () => {
  const [step, setStep] = useState<Step>("home");

  const back = () => {
    if (step === "upload") setStep("home");
    else if (step === "result") setStep("home");
    else setStep("home");
  };

  return (
    <main className="min-h-dvh bg-muted/40">
      <div className="toss-frame shadow-card">
        <TossHeader
          onBack={back}
          showShare={step === "result" || step === "home"}
        />
        {step === "home" && <HomeScreen onStart={() => setStep("upload")} />}
        {step === "upload" && <UploadScreen onSubmit={() => setStep("analyzing")} />}
        {step === "analyzing" && <AnalyzingScreen onDone={() => setStep("result")} />}
        {step === "result" && <ResultScreen onRestart={() => setStep("home")} />}
      </div>
    </main>
  );
};

export default Index;
