export const animalGroups = [
  { label: "Selecionar...", value: "" },
  { label: "Aves Passeriformes (K=129)", value: "129" },
  { label: "Aves Nao-Passeriformes (K=78)", value: "78" },
  { label: "Mamiferos Placentados (K=70)", value: "70" },
  { label: "Marsupiais/Xenarthra/Monotremata (K=49)", value: "49" },
];

export const modelPresets = [
  { label: "Selecionar...", value: "" },
  { label: "Cao - 10 kg", value: "cao", weight: "10", groupK: "70" },
  { label: "Gato - 4 kg", value: "gato", weight: "4", groupK: "70" },
  { label: "Porco - 100 kg", value: "porco", weight: "100", groupK: "70" },
  { label: "Cavalo/Vaca - 500 kg", value: "cavalo", weight: "500", groupK: "70" },
  { label: "Homem - 70 kg", value: "homem", weight: "70", groupK: "70" },
  { label: "Outro", value: "custom" },
];

export const referenceRows = [
  { group: "Aves Passeriformes", k: "129", temp: "42 C" },
  { group: "Aves Nao-Passeriformes", k: "78", temp: "40 C" },
  { group: "Mamiferos Placentados", k: "70", temp: "37 C" },
  { group: "Marsupiais / Xenarthra / Monotremata", k: "49", temp: "35 C" },
];

export const standardModels = [
  { animal: "Cao", weight: "10 kg", k: "70" },
  { animal: "Gato", weight: "4 kg", k: "70" },
  { animal: "Porco", weight: "100 kg", k: "70" },
  { animal: "Cavalo / Vaca", weight: "500 kg", k: "70" },
  { animal: "Homem", weight: "70 kg", k: "70" },
];
