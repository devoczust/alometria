import { animalGroups, modelPresets } from "../data/constants";
import { formatNumber } from "../utils/alometry";
import SectionCard from "./SectionCard";

export default function CalculatorTab({
  form,
  setForm,
  result,
  error,
  onCalculate,
}) {
  const targetSummary = form.targetName || "Animal alvo";
  const quickModels = modelPresets.filter((preset) => preset.weight);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleGroupChange(fieldPrefix, value) {
    if (fieldPrefix === "model") {
      setForm((current) => ({
        ...current,
        modelGroup: value,
        modelK: value || current.modelK,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      targetGroup: value,
      targetK: value || current.targetK,
    }));
  }

  function handlePresetChange(value) {
    const preset = modelPresets.find((item) => item.value === value);

    setForm((current) => ({
      ...current,
      modelPreset: value,
      modelWeight:
        preset && preset.value !== "custom" && preset.weight
          ? preset.weight
          : current.modelWeight,
      modelGroup:
        preset && preset.value !== "custom" && preset.groupK
          ? preset.groupK
          : current.modelGroup,
      modelK:
        preset && preset.value !== "custom" && preset.groupK
          ? preset.groupK
          : current.modelK,
    }));
  }

  return (
    <div className="tab-panel">
      <SectionCard title="// Animal modelo (referencia)">
        <div className="quick-preset-row">
          {quickModels.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`quick-preset${
                form.modelPreset === preset.value ? " active" : ""
              }`}
              onClick={() => handlePresetChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="row2">
          <div className="field">
            <label>Grupo do modelo</label>
            <select
              value={form.modelGroup}
              onChange={(event) =>
                handleGroupChange("model", event.target.value)
              }
            >
              {animalGroups.map((group) => (
                <option key={group.label} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Constante K do modelo</label>
            <input
              type="number"
              step="1"
              value={form.modelK}
              placeholder="ex: 70"
              onChange={(event) => updateField("modelK", event.target.value)}
            />
            <div className="hint">Preenche ao escolher o grupo acima.</div>
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Modelo padrao</label>
            <select
              value={form.modelPreset}
              onChange={(event) => handlePresetChange(event.target.value)}
            >
              {modelPresets.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Peso do modelo (kg)</label>
            <input
              type="number"
              step="0.01"
              value={form.modelWeight}
              placeholder="ex: 10"
              onChange={(event) =>
                updateField("modelWeight", event.target.value)
              }
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Dose no modelo (mg/kg)</label>
            <input
              type="number"
              step="0.001"
              value={form.modelDose}
              placeholder="ex: 20"
              onChange={(event) => updateField("modelDose", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Intervalo no modelo (h)</label>
            <input
              type="number"
              step="0.5"
              value={form.modelInterval}
              placeholder="ex: 24"
              onChange={(event) =>
                updateField("modelInterval", event.target.value)
              }
            />
            <div className="hint">Opcional. Tambem calcula o intervalo no alvo.</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="// Animal alvo (silvestre)">
        <div className="target-glance">
          <div>
            <span className="target-glance-label">Resumo rapido</span>
            <strong>{targetSummary}</strong>
          </div>
          <span className="target-glance-weight">
            {form.targetWeight ? `${form.targetWeight} kg` : "Peso pendente"}
          </span>
        </div>

        <div className="row2">
          <div className="field">
            <label>Grupo do alvo</label>
            <select
              value={form.targetGroup}
              onChange={(event) =>
                handleGroupChange("target", event.target.value)
              }
            >
              {animalGroups.map((group) => (
                <option key={group.label} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Constante K do alvo</label>
            <input
              type="number"
              step="1"
              value={form.targetK}
              placeholder="ex: 78"
              onChange={(event) => updateField("targetK", event.target.value)}
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Nome / especie do alvo</label>
            <input
              type="text"
              value={form.targetName}
              placeholder="ex: Crax fasciolata"
              className="plain-input"
              onChange={(event) => updateField("targetName", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Peso do alvo (kg)</label>
            <input
              type="number"
              step="0.01"
              value={form.targetWeight}
              placeholder="ex: 2.6"
              onChange={(event) =>
                updateField("targetWeight", event.target.value)
              }
            />
          </div>
        </div>

        {error ? <div className="alert-box">{error}</div> : null}
      </SectionCard>

      <div className="mobile-action-bar">
        <button className="btn-primary sticky-cta" type="button" onClick={onCalculate}>
          Calcular dose alometrica
        </button>
      </div>

      {result ? (
        <section className="result-area show">
          <div className="result-grid">
            <div className="mini-result-card">
              <span>Total</span>
              <strong>{formatNumber(result.allometricMg, 4)} mg</strong>
            </div>
            <div className="mini-result-card">
              <span>Por kg</span>
              <strong>{formatNumber(result.allometricMgKg, 4)} mg/kg</strong>
            </div>
            <div className="mini-result-card">
              <span>Alvo</span>
              <strong>{targetSummary}</strong>
            </div>
          </div>

          <div className="result-final">
            <div className="result-label-sm">// Dose alometrica</div>
            <div className="result-big">
              {formatNumber(result.allometricMg, 4)} <span>mg total</span>
            </div>
            <div className="result-subtext">
              = {formatNumber(result.allometricMgKg, 4)} mg/kg · {targetSummary} (
              {form.targetWeight} kg)
            </div>
          </div>

          <div className="steps-calc">
            <div className="steps-calc-title">// Passo a passo completo</div>
            <div className="calc-step-list">
              {result.steps.map((step) => (
                <div
                  key={step.key}
                  className={`cs${step.highlight ? " cs-convert" : ""}`}
                >
                  <span className="n">{step.index}</span> {step.title}
                  <span className="src">{step.source}</span>
                  <span className="op">{step.expression}</span> ={" "}
                  <span className={step.highlight ? "fin" : "v"}>
                    {step.result}
                  </span>
                  <span className="why">{step.reason}</span>
                </div>
              ))}
            </div>
          </div>

          {result.interval ? (
            <div className="interval-area show">
              <div className="interval-result">
                <div className="result-label-sm interval-label">
                  // Intervalo no alvo
                </div>
                <div className="interval-val">
                  {formatNumber(result.interval.value, 2)}h
                </div>
                <div className="interval-caption">horas entre doses</div>
                <div className="interval-steps">
                  {result.interval.lines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
