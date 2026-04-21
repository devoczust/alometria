export const difficultyOptions = [
  { value: "mixed", label: "Mista" },
  { value: "easy", label: "Facil" },
  { value: "medium", label: "Media" },
  { value: "hard", label: "Dificil" },
];

const referenceModels = [
  { name: "gato", weight: 4, k: 70 },
  { name: "cao", weight: 10, k: 70 },
  { name: "homem", weight: 70, k: 70 },
  { name: "porco", weight: 100, k: 70 },
  { name: "cavalo", weight: 500, k: 70 },
];

function pickClosestModel(targetWeight) {
  return referenceModels.reduce((closest, current) => {
    if (!closest) {
      return current;
    }

    const currentDistance = Math.abs(current.weight - targetWeight);
    const closestDistance = Math.abs(closest.weight - targetWeight);
    return currentDistance < closestDistance ? current : closest;
  }, null);
}

function formatAnimal(scientificName, commonName) {
  return commonName
    ? `${scientificName} (${commonName})`
    : scientificName;
}

function buildContext(question) {
  return [
    question.medication,
    formatAnimal(question.targetScientificName, question.targetCommonName),
    question.targetGroupLabel,
    `modelo ${question.modelName}`,
  ].join(" · ");
}

function buildPrompt(question) {
  const targetAnimal = formatAnimal(
    question.targetScientificName,
    question.targetCommonName,
  );
  const modelAnimal = `${question.modelName} (${question.pM} kg, K=${question.kM})`;

  if (question.type === "interval") {
    return [
      `Medicamento: ${question.medication}.`,
      `Animal alvo: ${targetAnimal}, com ${question.pA} kg e K=${question.kA}.`,
      `Animal modelo escolhido por proximidade: ${modelAnimal}.`,
      `No modelo, o medicamento e administrado a cada ${question.intM} horas.`,
      "Calcule o intervalo alometrico no alvo em horas. Use 1 casa decimal.",
    ].join(" ");
  }

  const outputLabel =
    question.type === "mgkg"
      ? "Calcule a dose final em mg/kg para o alvo."
      : "Calcule a dose alometrica em mg total para o alvo.";

  return [
    `Medicamento: ${question.medication}.`,
    `Animal alvo: ${targetAnimal}, com ${question.pA} kg e K=${question.kA}.`,
    `Animal modelo escolhido por proximidade: ${modelAnimal}.`,
    `Dose de referencia no modelo: ${question.dM} mg/kg.`,
    outputLabel,
  ].join(" ");
}

function createQuestion(data) {
  const model = pickClosestModel(data.pA);

  return {
    ...data,
    modelName: model.name,
    kM: model.k,
    pM: model.weight,
    context: buildContext({
      ...data,
      modelName: model.name,
      kM: model.k,
      pM: model.weight,
    }),
    prompt: buildPrompt({
      ...data,
      modelName: model.name,
      kM: model.k,
      pM: model.weight,
    }),
  };
}

export const quizQuestionBank = [
  createQuestion({
    id: "easy-speothos-mg",
    difficulty: "easy",
    medication: "meloxicam",
    targetScientificName: "Speothos venaticus",
    targetCommonName: "cachorro-vinagre",
    targetGroupLabel: "mamifero placentado",
    dM: 10,
    kA: 70,
    pA: 8,
    type: "mg",
  }),
  createQuestion({
    id: "easy-amazona-mg",
    difficulty: "easy",
    medication: "enrofloxacina",
    targetScientificName: "Amazona amazonica",
    targetCommonName: "papagaio-do-mangue",
    targetGroupLabel: "ave nao-passeriforme",
    dM: 5,
    kA: 78,
    pA: 0.4,
    type: "mg",
  }),
  createQuestion({
    id: "easy-coendou-mg",
    difficulty: "easy",
    medication: "cetoprofeno",
    targetScientificName: "Coendou prehensilis",
    targetCommonName: "ourico-cacheiro",
    targetGroupLabel: "mamifero placentado",
    dM: 8,
    kA: 70,
    pA: 1.8,
    type: "mg",
  }),
  createQuestion({
    id: "easy-speothos-interval",
    difficulty: "easy",
    medication: "tramadol",
    targetScientificName: "Speothos venaticus",
    targetCommonName: "cachorro-vinagre",
    targetGroupLabel: "calculo de intervalo",
    dM: 0,
    kA: 70,
    pA: 8,
    intM: 24,
    type: "interval",
  }),
  createQuestion({
    id: "easy-mazama-mg",
    difficulty: "easy",
    medication: "amoxicilina",
    targetScientificName: "Mazama gouazoubira",
    targetCommonName: "veado-catingueiro",
    targetGroupLabel: "mamifero placentado",
    dM: 6,
    kA: 70,
    pA: 17,
    type: "mg",
  }),
  createQuestion({
    id: "easy-cyanocorax-mg",
    difficulty: "easy",
    medication: "itraconazol",
    targetScientificName: "Cyanocorax chrysops",
    targetCommonName: "gralha-do-campo",
    targetGroupLabel: "ave nao-passeriforme",
    dM: 4,
    kA: 78,
    pA: 0.23,
    type: "mg",
  }),
  createQuestion({
    id: "medium-crax-mg",
    difficulty: "medium",
    medication: "marbofloxacina",
    targetScientificName: "Crax fasciolata",
    targetCommonName: "mutum-de-penacho",
    targetGroupLabel: "ave nao-passeriforme",
    dM: 20,
    kA: 78,
    pA: 2.6,
    type: "mg",
  }),
  createQuestion({
    id: "medium-crax-mgkg",
    difficulty: "medium",
    medication: "marbofloxacina",
    targetScientificName: "Crax fasciolata",
    targetCommonName: "mutum-de-penacho",
    targetGroupLabel: "conversao para mg/kg",
    dM: 20,
    kA: 78,
    pA: 2.6,
    type: "mgkg",
  }),
  createQuestion({
    id: "medium-tamandua-mg",
    difficulty: "medium",
    medication: "metadona",
    targetScientificName: "Tamandua tetradactyla",
    targetCommonName: "tamandua-mirim",
    targetGroupLabel: "xenarthra",
    dM: 12,
    kA: 49,
    pA: 5.4,
    type: "mg",
  }),
  createQuestion({
    id: "medium-amazona-interval",
    difficulty: "medium",
    medication: "voriconazol",
    targetScientificName: "Amazona aestiva",
    targetCommonName: "papagaio-verdadeiro",
    targetGroupLabel: "intervalo entre doses",
    dM: 0,
    kA: 78,
    pA: 0.45,
    intM: 12,
    type: "interval",
  }),
  createQuestion({
    id: "medium-sapajus-mgkg",
    difficulty: "medium",
    medication: "gabapentina",
    targetScientificName: "Sapajus apella",
    targetCommonName: "macaco-prego",
    targetGroupLabel: "primata neotropical",
    dM: 9,
    kA: 70,
    pA: 3.1,
    type: "mgkg",
  }),
  createQuestion({
    id: "medium-ara-interval",
    difficulty: "medium",
    medication: "fluconazol",
    targetScientificName: "Ara ararauna",
    targetCommonName: "arara-caninde",
    targetGroupLabel: "intervalo em ave nao-passeriforme",
    dM: 0,
    kA: 78,
    pA: 1.1,
    intM: 18,
    type: "interval",
  }),
  createQuestion({
    id: "hard-didelphis-mgkg",
    difficulty: "hard",
    medication: "prednisolona",
    targetScientificName: "Didelphis albiventris",
    targetCommonName: "gamba-de-orelha-branca",
    targetGroupLabel: "marsupial",
    dM: 6,
    kA: 49,
    pA: 1.2,
    type: "mgkg",
  }),
  createQuestion({
    id: "hard-turdus-mg",
    difficulty: "hard",
    medication: "doxiciclina",
    targetScientificName: "Turdus rufiventris",
    targetCommonName: "sabia-laranjeira",
    targetGroupLabel: "ave passeriforme",
    dM: 15,
    kA: 129,
    pA: 0.075,
    type: "mg",
  }),
  createQuestion({
    id: "hard-chrysocyon-mg",
    difficulty: "hard",
    medication: "omeprazol",
    targetScientificName: "Chrysocyon brachyurus",
    targetCommonName: "lobo-guara",
    targetGroupLabel: "mamifero placentado",
    dM: 2,
    kA: 70,
    pA: 23,
    type: "mg",
  }),
  createQuestion({
    id: "hard-didelphis-interval",
    difficulty: "hard",
    medication: "fenobarbital",
    targetScientificName: "Didelphis albiventris",
    targetCommonName: "gamba-de-orelha-branca",
    targetGroupLabel: "intervalo com K diferente",
    dM: 0,
    kA: 49,
    pA: 1.1,
    intM: 8,
    type: "interval",
  }),
  createQuestion({
    id: "hard-ramphastos-mgkg",
    difficulty: "hard",
    medication: "ceftiofur",
    targetScientificName: "Ramphastos toco",
    targetCommonName: "tucano-toco",
    targetGroupLabel: "ave nao-passeriforme",
    dM: 18,
    kA: 78,
    pA: 0.62,
    type: "mgkg",
  }),
  createQuestion({
    id: "hard-myrmecophaga-mg",
    difficulty: "hard",
    medication: "cetamina",
    targetScientificName: "Myrmecophaga tridactyla",
    targetCommonName: "tamandua-bandeira",
    targetGroupLabel: "xenarthra",
    dM: 1.5,
    kA: 49,
    pA: 28,
    type: "mg",
  }),
];
