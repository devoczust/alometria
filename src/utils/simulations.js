import { difficultyOptions, quizQuestionBank } from "../data/quizQuestions";

const HISTORY_STORAGE_KEY = "alometria-simulations";
const ACTIVE_STORAGE_KEY = "alometria-active-simulation";
export const MIN_SIMULATION_QUESTIONS = 2;

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(key, fallbackValue) {
  if (!hasBrowserStorage()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function shuffle(list) {
  const clonedList = [...list];

  for (let index = clonedList.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clonedList[index], clonedList[randomIndex]] = [
      clonedList[randomIndex],
      clonedList[index],
    ];
  }

  return clonedList;
}

function getSimulationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `sim-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function getDifficultyLabel(difficulty) {
  const option = difficultyOptions.find((item) => item.value === difficulty);
  return option ? option.label : "Mista";
}

export function formatSimulationDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function getElapsedSeconds(startedAt, endedAt = new Date().toISOString()) {
  const startTimestamp = new Date(startedAt).getTime();
  const endTimestamp = new Date(endedAt).getTime();
  return Math.max(0, Math.floor((endTimestamp - startTimestamp) / 1000));
}

export function getQuestionPool(difficulty) {
  if (difficulty === "mixed") {
    return quizQuestionBank;
  }

  return quizQuestionBank.filter((question) => question.difficulty === difficulty);
}

export function getAvailableQuestionCount(difficulty) {
  return getQuestionPool(difficulty).length;
}

export function buildSimulationName({ difficulty, questionCount, startedAt }) {
  return `${getDifficultyLabel(difficulty)} · ${questionCount} questoes · ${formatSimulationDate(startedAt)}`;
}

export function createSimulation({ difficulty, questionCount }) {
  const startedAt = new Date().toISOString();
  const pool = getQuestionPool(difficulty);
  const normalizedCount = Math.max(
    MIN_SIMULATION_QUESTIONS,
    Math.min(Number(questionCount) || MIN_SIMULATION_QUESTIONS, pool.length),
  );
  const questions = shuffle(pool).slice(0, normalizedCount);

  return {
    id: getSimulationId(),
    name: buildSimulationName({
      difficulty,
      questionCount: questions.length,
      startedAt,
    }),
    status: "in_progress",
    difficulty,
    questionCount: questions.length,
    startedAt,
    currentIndex: 0,
    score: 0,
    questions,
    responses: questions.map((question) => ({
      questionId: question.id,
      scratch: "",
      answer: "",
      checked: false,
      correct: null,
      expected: null,
      steps: [],
    })),
  };
}

export function buildCompletedSimulation(simulation) {
  const finishedAt = new Date().toISOString();
  const completedQuestions = simulation.responses.filter(
    (response) => response.checked,
  ).length;
  const score = simulation.responses.filter((response) => response.correct).length;

  return {
    ...simulation,
    status: "completed",
    finishedAt,
    durationSeconds: getElapsedSeconds(simulation.startedAt, finishedAt),
    completedQuestions,
    score,
  };
}

export function loadSimulationHistory() {
  const history = readStorage(HISTORY_STORAGE_KEY, []);
  return Array.isArray(history) ? history : [];
}

export function saveSimulationHistory(history) {
  writeStorage(HISTORY_STORAGE_KEY, history);
}

export function loadActiveSimulation() {
  const simulation = readStorage(ACTIVE_STORAGE_KEY, null);
  return simulation && simulation.status === "in_progress" ? simulation : null;
}

export function saveActiveSimulation(simulation) {
  writeStorage(ACTIVE_STORAGE_KEY, simulation);
}

export function clearActiveSimulation() {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_STORAGE_KEY);
}
