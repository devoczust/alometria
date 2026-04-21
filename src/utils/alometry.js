export function formatNumber(value, digits = 4) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatElapsedTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export function getQuestionUnit(type) {
  if (type === "interval") {
    return "horas";
  }

  if (type === "mgkg") {
    return "mg/kg";
  }

  return "mg total";
}

export function tmb(k, mass) {
  return k * mass ** 0.75;
}

export function buildCalculation(kM, pM, dM, kA, pA, intM) {
  const doseTotal = dM * pM;
  const tmbModel = tmb(kM, pM);
  const tmbTarget = tmb(kA, pA);
  const dosePerKcal = doseTotal / tmbModel;
  const allometricMg = dosePerKcal * tmbTarget;
  const allometricMgKg = allometricMg / pA;

  const steps = [
    {
      key: "step-1",
      index: "1.",
      title: "Dose total do modelo",
      source: `dose digitada (${formatNumber(dM)} mg/kg) x peso do modelo (${formatNumber(pM)} kg)`,
      expression: `${formatNumber(dM)} x ${formatNumber(pM)}`,
      result: `${formatNumber(doseTotal, 4)} mg`,
      reason: "Converte mg/kg em mg absolutos para o animal de referencia.",
    },
    {
      key: "step-2a",
      index: "2a.",
      title: "TMB do modelo",
      source: `K do modelo (${formatNumber(kM, 0)}) x peso do modelo (${formatNumber(pM)} kg)^0,75`,
      expression: `${formatNumber(kM, 0)} x ${formatNumber(pM)}^0,75`,
      result: `${formatNumber(tmbModel, 4)} Kcal/24h`,
      reason: "Estabelece a regua metabolica do modelo.",
    },
    {
      key: "step-2b",
      index: "2b.",
      title: "TMB do alvo",
      source: `K do alvo (${formatNumber(kA, 0)}) x peso do alvo (${formatNumber(pA)} kg)^0,75`,
      expression: `${formatNumber(kA, 0)} x ${formatNumber(pA)}^0,75`,
      result: `${formatNumber(tmbTarget, 4)} Kcal/24h`,
      reason: "Escala o calculo para o metabolismo do animal silvestre.",
    },
    {
      key: "step-3",
      index: "3.",
      title: "Dose por Kcal",
      source: "Dose total do modelo dividida pela TMB do modelo.",
      expression: `${formatNumber(doseTotal, 4)} / ${formatNumber(tmbModel, 4)}`,
      result: `${formatNumber(dosePerKcal, 6)} mg/Kcal`,
      reason: "Normaliza a dose pelo metabolismo do modelo.",
    },
    {
      key: "step-4",
      index: "4.",
      title: "Dose alometrica",
      source: "Dose/Kcal multiplicada pela TMB do alvo.",
      expression: `${formatNumber(dosePerKcal, 6)} x ${formatNumber(tmbTarget, 4)}`,
      result: `${formatNumber(allometricMg, 4)} mg`,
      reason: "Entrega a dose total extrapolada para o alvo.",
    },
    {
      key: "step-convert",
      index: "->",
      title: "Conversao para mg/kg",
      source: "Dose total do alvo dividida pelo peso do alvo.",
      expression: `${formatNumber(allometricMg, 4)} / ${formatNumber(pA)}`,
      result: `${formatNumber(allometricMgKg, 4)} mg/kg`,
      reason: "Facilita comparar com literatura e registrar na ficha clinica.",
      highlight: true,
    },
  ];

  const interval =
    Number.isFinite(intM) && intM > 0
      ? (() => {
          const tmeModel = tmbModel / pM;
          const tmeTarget = tmbTarget / pA;
          const targetInterval = (tmeModel * intM) / tmeTarget;

          return {
            value: targetInterval,
            lines: [
              `TME modelo = ${formatNumber(tmbModel, 4)} / ${formatNumber(pM)} = ${formatNumber(tmeModel, 4)} Kcal/24h/kg`,
              `TME alvo = ${formatNumber(tmbTarget, 4)} / ${formatNumber(pA)} = ${formatNumber(tmeTarget, 4)} Kcal/24h/kg`,
              `Intervalo alvo = (${formatNumber(tmeModel, 4)} x ${formatNumber(intM)}) / ${formatNumber(tmeTarget, 4)} = ${formatNumber(targetInterval, 2)} h`,
            ],
          };
        })()
      : null;

  return {
    allometricMg,
    allometricMgKg,
    steps,
    interval,
  };
}

export function solveQuizQuestion(question) {
  const tmbModel = tmb(question.kM, question.pM);
  const tmbTarget = tmb(question.kA, question.pA);

  if (question.type === "interval") {
    const tmeModel = tmbModel / question.pM;
    const tmeTarget = tmbTarget / question.pA;
    const answer = (tmeModel * question.intM) / tmeTarget;

    return {
      answer,
      steps: [
        `TMB modelo = ${question.kM} x ${question.pM}^0,75 = ${formatNumber(tmbModel, 4)} Kcal/24h`,
        `TMB alvo = ${question.kA} x ${question.pA}^0,75 = ${formatNumber(tmbTarget, 4)} Kcal/24h`,
        `TME modelo = ${formatNumber(tmbModel, 4)} / ${question.pM} = ${formatNumber(tmeModel, 4)}`,
        `TME alvo = ${formatNumber(tmbTarget, 4)} / ${question.pA} = ${formatNumber(tmeTarget, 4)}`,
        `Intervalo alvo = (${formatNumber(tmeModel, 4)} x ${question.intM}) / ${formatNumber(tmeTarget, 4)} = ${formatNumber(answer, 2)} h`,
      ],
    };
  }

  const doseTotal = question.dM * question.pM;
  const dosePerKcal = doseTotal / tmbModel;
  const allometricMg = dosePerKcal * tmbTarget;
  const allometricMgKg = allometricMg / question.pA;

  return {
    answer: question.type === "mgkg" ? allometricMgKg : allometricMg,
    steps: [
      `Dose total do modelo = ${formatNumber(question.dM)} x ${question.pM} = ${formatNumber(doseTotal, 4)} mg`,
      `TMB modelo = ${question.kM} x ${question.pM}^0,75 = ${formatNumber(tmbModel, 4)} Kcal/24h`,
      `TMB alvo = ${question.kA} x ${question.pA}^0,75 = ${formatNumber(tmbTarget, 4)} Kcal/24h`,
      `Dose/Kcal = ${formatNumber(doseTotal, 4)} / ${formatNumber(tmbModel, 4)} = ${formatNumber(dosePerKcal, 6)} mg/Kcal`,
      `Dose alvo = ${formatNumber(dosePerKcal, 6)} x ${formatNumber(tmbTarget, 4)} = ${formatNumber(allometricMg, 4)} mg`,
      question.type === "mgkg"
        ? `Conversao = ${formatNumber(allometricMg, 4)} / ${question.pA} = ${formatNumber(allometricMgKg, 4)} mg/kg`
        : null,
    ].filter(Boolean),
  };
}

export function isAnswerCorrect(userValue, expectedValue) {
  const tolerance = Math.max(Math.abs(expectedValue) * 0.02, 0.001);
  return Math.abs(userValue - expectedValue) <= tolerance;
}
