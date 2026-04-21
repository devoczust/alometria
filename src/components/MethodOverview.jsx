export default function MethodOverview({ isOpen, onToggle }) {
  const steps = [
    {
      number: "1",
      title: "Dose total do modelo",
      formula: "Dose_total = dose (mg/kg) x peso_modelo",
      description: "Converte mg/kg para mg totais do animal de referencia.",
    },
    {
      number: "2",
      title: "TMB do modelo e do alvo",
      formula: "TMB = K x M^0,75 (Kcal/24h)",
      description: "K vem da tabela de Hainsworth e M e a massa em kg.",
    },
    {
      number: "3",
      title: "Dose por Kcal",
      formula: "Dose/Kcal = Dose_total_modelo / TMB_modelo",
      description: "Normaliza a dose pela energia metabolica do modelo.",
      highlight: true,
    },
    {
      number: "4",
      title: "Dose alometrica",
      formula: "Dose_alvo (mg) = Dose/Kcal x TMB_alvo",
      description: "Reescala a dose para o metabolismo do animal-alvo.",
      highlight: true,
    },
  ];

  return (
    <section className="method-box">
      <div className="method-header">
        <div>
          <div className="method-title">// Os 4 passos do metodo</div>
          <p className="method-summary">
            Resumo rapido para revisar antes de calcular ou responder as questoes.
          </p>
        </div>
        <button className="ghost-toggle" type="button" onClick={onToggle}>
          {isOpen ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {isOpen ? (
        <div className="steps-row">
          {steps.map((step) => (
            <article
              key={step.number}
              className={`method-step${step.highlight ? " hl" : ""}`}
            >
              <div className="step-num">{step.number}</div>
              <div>
                <div className="step-name">{step.title}</div>
                <div className="step-formula">{step.formula}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
