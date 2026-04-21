import { useState } from "react";
import CalculatorTab from "./components/CalculatorTab";
import MethodOverview from "./components/MethodOverview";
import QuizTab from "./components/QuizTab";
import ReferenceTab from "./components/ReferenceTab";
import { buildCalculation } from "./utils/alometry";

export default function App() {
  const [activeTab, setActiveTab] = useState("calc");
  const [showMethod, setShowMethod] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [form, setForm] = useState({
    modelGroup: "",
    modelK: "",
    modelPreset: "",
    modelWeight: "",
    modelDose: "",
    modelInterval: "",
    targetGroup: "",
    targetK: "",
    targetName: "",
    targetWeight: "",
  });

  function calculateDose() {
    const kM = Number.parseFloat(form.modelK);
    const pM = Number.parseFloat(form.modelWeight);
    const dM = Number.parseFloat(form.modelDose);
    const kA = Number.parseFloat(form.targetK);
    const pA = Number.parseFloat(form.targetWeight);
    const intM = Number.parseFloat(form.modelInterval);

    if ([kM, pM, dM, kA, pA].some((value) => Number.isNaN(value))) {
      setCalcError("Preencha os campos obrigatorios do modelo e do alvo.");
      setCalcResult(null);
      return;
    }

    if ([kM, pM, dM, kA, pA].some((value) => value <= 0)) {
      setCalcError("Use valores maiores que zero para K, peso e dose.");
      setCalcResult(null);
      return;
    }

    setCalcError("");
    setCalcResult(buildCalculation(kM, pM, dM, kA, pA, intM));
  }

  return (
    <main className="app-shell">
      <div className="wrap">
        <header>
          <div className="eyebrow">Farmacologia Veterinaria · Animais Silvestres</div>
          <h1>
            Dose <em>Alometrica</em>
          </h1>
          <p className="subtitle">
            Metodo via TMB (Hainsworth) · Calculadora, simulados e referencia
          </p>
        </header>

        <MethodOverview
          isOpen={showMethod}
          onToggle={() => setShowMethod((current) => !current)}
        />

        <nav className="tabs" aria-label="Abas principais">
          <button
            type="button"
            className={`tab${activeTab === "calc" ? " active" : ""}`}
            onClick={() => setActiveTab("calc")}
          >
            Calculadora
          </button>
          <button
            type="button"
            className={`tab${activeTab === "quiz" ? " active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Simulados
          </button>
          <button
            type="button"
            className={`tab${activeTab === "ref" ? " active" : ""}`}
            onClick={() => setActiveTab("ref")}
          >
            Referencia
          </button>
        </nav>

        {activeTab === "calc" ? (
          <CalculatorTab
            form={form}
            setForm={setForm}
            result={calcResult}
            error={calcError}
            onCalculate={calculateDose}
          />
        ) : null}

        {activeTab === "quiz" ? <QuizTab /> : null}
        {activeTab === "ref" ? <ReferenceTab /> : null}
      </div>
    </main>
  );
}
