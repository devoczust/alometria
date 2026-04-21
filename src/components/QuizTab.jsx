import { useEffect, useState } from "react";
import { difficultyOptions } from "../data/quizQuestions";
import {
  formatElapsedTime,
  formatNumber,
  getQuestionUnit,
  isAnswerCorrect,
  solveQuizQuestion,
} from "../utils/alometry";
import {
  MIN_SIMULATION_QUESTIONS,
  buildCompletedSimulation,
  clearActiveSimulation,
  createSimulation,
  formatSimulationDate,
  getAvailableQuestionCount,
  getDifficultyLabel,
  getElapsedSeconds,
  loadActiveSimulation,
  loadSimulationHistory,
  saveActiveSimulation,
  saveSimulationHistory,
} from "../utils/simulations";
import SectionCard from "./SectionCard";

function HistoryCard({ simulation, isOpen, onToggle }) {
  return (
    <article className="history-card">
      <button className="history-card-top" type="button" onClick={onToggle}>
        <div>
          <strong>{simulation.name}</strong>
          <div className="history-meta">
            <span>{getDifficultyLabel(simulation.difficulty)}</span>
            <span>{simulation.questionCount} questoes</span>
            <span>{formatElapsedTime(simulation.durationSeconds || 0)}</span>
          </div>
        </div>
        <span className="history-score">
          {simulation.score}/{simulation.questionCount}
        </span>
      </button>

      {isOpen ? (
        <div className="history-detail">
          <div className="history-detail-top">
            <span>Finalizado em {formatSimulationDate(simulation.finishedAt)}</span>
            <span>
              Aproveitamento{" "}
              {Math.round((simulation.score / simulation.questionCount) * 100)}%
            </span>
          </div>

          <div className="history-response-list">
            {simulation.questions.map((question, index) => {
              const response = simulation.responses[index];

              return (
                <section key={question.id} className="history-response-card">
                  <div className="history-response-head">
                    <strong>
                      Questao {index + 1} · {getQuestionUnit(question.type)}
                    </strong>
                    <span
                      className={`history-badge${
                        response.correct ? " ok" : " err"
                      }`}
                    >
                      {response.correct ? "Correta" : "Revisar"}
                    </span>
                  </div>

                  <p className="history-question-text">{question.prompt}</p>

                  <div className="history-answer-grid">
                    <div>
                      <span>Resposta enviada</span>
                      <strong>
                        {response.answer === "" ? "-" : response.answer}{" "}
                        {getQuestionUnit(question.type)}
                      </strong>
                    </div>
                    <div>
                      <span>Resposta esperada</span>
                      <strong>
                        {formatNumber(response.expected, 4)}{" "}
                        {getQuestionUnit(question.type)}
                      </strong>
                    </div>
                  </div>

                  <div className="history-scratch">
                    <span>Rascunho salvo</span>
                    <pre>{response.scratch || "Sem anotacoes."}</pre>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function QuizTab() {
  const [history, setHistory] = useState(() => loadSimulationHistory());
  const [activeSimulation, setActiveSimulation] = useState(() =>
    loadActiveSimulation(),
  );
  const [selectedHistoryId, setSelectedHistoryId] = useState(() => {
    const initialHistory = loadSimulationHistory();
    return initialHistory.length > 0 ? initialHistory[0].id : null;
  });
  const [config, setConfig] = useState({
    difficulty: "mixed",
    questionCount: Math.max(
      MIN_SIMULATION_QUESTIONS,
      Math.min(5, getAvailableQuestionCount("mixed")),
    ),
  });
  const [uiError, setUiError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    activeSimulation ? getElapsedSeconds(activeSimulation.startedAt) : 0,
  );

  const availableCount = getAvailableQuestionCount(config.difficulty);

  useEffect(() => {
    if (!activeSimulation) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(getElapsedSeconds(activeSimulation.startedAt));

    const timerId = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(activeSimulation.startedAt));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeSimulation]);

  useEffect(() => {
    if (activeSimulation) {
      saveActiveSimulation(activeSimulation);
      return;
    }

    clearActiveSimulation();
  }, [activeSimulation]);

  useEffect(() => {
    saveSimulationHistory(history);
  }, [history]);

  useEffect(() => {
    const normalizedCount = Math.max(
      MIN_SIMULATION_QUESTIONS,
      Math.min(Number(config.questionCount) || MIN_SIMULATION_QUESTIONS, availableCount),
    );

    if (Number(config.questionCount) !== normalizedCount) {
      setConfig((current) => ({
        ...current,
        questionCount: normalizedCount,
      }));
    }
  }, [availableCount, config.questionCount]);

  function updateCurrentResponse(field, value) {
    setActiveSimulation((current) => {
      if (!current) {
        return current;
      }

      const responses = [...current.responses];
      responses[current.currentIndex] = {
        ...responses[current.currentIndex],
        [field]: value,
      };

      return {
        ...current,
        responses,
      };
    });
    setUiError("");
  }

  function handleStartSimulation() {
    const questionCount = Math.max(
      MIN_SIMULATION_QUESTIONS,
      Math.min(Number(config.questionCount) || MIN_SIMULATION_QUESTIONS, availableCount),
    );
    const simulation = createSimulation({
      difficulty: config.difficulty,
      questionCount,
    });

    setActiveSimulation(simulation);
    setUiError("");
  }

  function handleCheckAnswer() {
    if (!activeSimulation) {
      return;
    }

    const currentQuestion = activeSimulation.questions[activeSimulation.currentIndex];
    const currentResponse = activeSimulation.responses[activeSimulation.currentIndex];
    const parsedValue = Number.parseFloat(
      String(currentResponse.answer).replace(",", "."),
    );

    if (Number.isNaN(parsedValue)) {
      setUiError("Digite uma resposta numerica antes de verificar.");
      return;
    }

    const solution = solveQuizQuestion(currentQuestion);
    const correct = isAnswerCorrect(parsedValue, solution.answer);

    setActiveSimulation((current) => {
      if (!current) {
        return current;
      }

      const responses = [...current.responses];
      responses[current.currentIndex] = {
        ...responses[current.currentIndex],
        checked: true,
        correct,
        expected: solution.answer,
        steps: solution.steps,
      };

      return {
        ...current,
        responses,
        score: responses.filter((response) => response.correct).length,
      };
    });
    setUiError("");
  }

  function handleNextQuestion() {
    if (!activeSimulation) {
      return;
    }

    const currentResponse = activeSimulation.responses[activeSimulation.currentIndex];

    if (!currentResponse.checked) {
      setUiError("Verifique a resposta da questao antes de avancar.");
      return;
    }

    if (activeSimulation.currentIndex + 1 >= activeSimulation.questions.length) {
      const completedSimulation = buildCompletedSimulation(activeSimulation);
      const nextHistory = [completedSimulation, ...history];

      setHistory(nextHistory);
      setSelectedHistoryId(completedSimulation.id);
      setActiveSimulation(null);
      setUiError("");
      return;
    }

    setActiveSimulation((current) => ({
      ...current,
      currentIndex: current.currentIndex + 1,
    }));
    setUiError("");
  }

  function handleDiscardDraft() {
    setActiveSimulation(null);
    setUiError("");
  }

  function toggleHistoryCard(simulationId) {
    setSelectedHistoryId((current) =>
      current === simulationId ? null : simulationId,
    );
  }

  if (!activeSimulation) {
    return (
      <div className="tab-panel quiz-home">
        <SectionCard title="// Simulado de prova">
          <div className="setup-grid">
            <div className="setup-copy">
              <h3>Monte sua simulacao</h3>
              <p>
                Escolha a dificuldade, defina quantas questoes quer responder e
                comece o treino com cronometro e salvamento automatico local.
              </p>
            </div>

            <div className="field">
              <label>Dificuldade</label>
              <div className="difficulty-row">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`difficulty-chip${
                      config.difficulty === option.value ? " active" : ""
                    }`}
                    onClick={() =>
                      setConfig((current) => ({
                        ...current,
                        difficulty: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-quantity-row">
              <div className="field">
                <label>Quantidade de exercicios</label>
                <input
                  type="number"
                  min={MIN_SIMULATION_QUESTIONS}
                  max={availableCount}
                  value={config.questionCount}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      questionCount: event.target.value,
                    }))
                  }
                />
                <div className="hint">
                  Escolha entre {MIN_SIMULATION_QUESTIONS} e {availableCount} questoes
                  nessa dificuldade.
                </div>
              </div>

              <div className="setup-summary">
                <span>Resumo</span>
                <strong>{getDifficultyLabel(config.difficulty)}</strong>
                <small>
                  {Math.max(
                    MIN_SIMULATION_QUESTIONS,
                    Math.min(
                      Number(config.questionCount) || MIN_SIMULATION_QUESTIONS,
                      availableCount,
                    ),
                  )}{" "}
                  questoes
                </small>
              </div>
            </div>

            <button className="btn-primary" type="button" onClick={handleStartSimulation}>
              Iniciar simulacao
            </button>
          </div>
        </SectionCard>

        <SectionCard title="// Simulados salvos">
          {history.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhuma simulacao salva ainda.</strong>
              <p>
                Assim que voce concluir um simulado, ele vai aparecer aqui com
                respostas, rascunho e cronometro.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((simulation) => (
                <HistoryCard
                  key={simulation.id}
                  simulation={simulation}
                  isOpen={selectedHistoryId === simulation.id}
                  onToggle={() => toggleHistoryCard(simulation.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  const currentQuestion = activeSimulation.questions[activeSimulation.currentIndex];
  const currentResponse = activeSimulation.responses[activeSimulation.currentIndex];
  const progress = ((activeSimulation.currentIndex + 1) / activeSimulation.questionCount) * 100;

  return (
    <div className="tab-panel">
      <section className="card">
        <div className="sim-header">
          <div>
            <div className="card-title no-gap">// Simulado em andamento</div>
            <div className="sim-name">{activeSimulation.name}</div>
          </div>

          <div className="sim-header-side">
            <div className="timer-pill">{formatElapsedTime(elapsedSeconds)}</div>
            <button className="secondary-btn" type="button" onClick={handleDiscardDraft}>
              Descartar
            </button>
          </div>
        </div>

        <div className="sim-meta">
          <span className="score-pill">
            {activeSimulation.score} / {activeSimulation.questionCount}
          </span>
          <span className="meta-pill">{getDifficultyLabel(activeSimulation.difficulty)}</span>
          <span className="meta-pill">
            Questao {activeSimulation.currentIndex + 1} de {activeSimulation.questionCount}
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="q-context">
          <strong>Contexto:</strong> {currentQuestion.context}
        </div>

        <p className="q-text">
          <strong>
            Questao {activeSimulation.currentIndex + 1}/{activeSimulation.questionCount}
          </strong>
          <br />
          <br />
          {currentQuestion.prompt}
        </p>

        <div className="scratch-wrap">
          <div className="scratch-label">
            <span>// rascunho salvo automaticamente</span>
            <button
              className="btn-clear-scratch"
              type="button"
              onClick={() => updateCurrentResponse("scratch", "")}
            >
              limpar
            </button>
          </div>

          <textarea
            className="scratch"
            value={currentResponse.scratch}
            spellCheck="false"
            placeholder="Use este espaco para montar o raciocinio da questao."
            onChange={(event) => updateCurrentResponse("scratch", event.target.value)}
          />
        </div>

        <div className="answer-row">
          <input
            type="number"
            step="0.0001"
            value={currentResponse.answer}
            placeholder={`Sua resposta (${getQuestionUnit(currentQuestion.type)})`}
            onChange={(event) => updateCurrentResponse("answer", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !currentResponse.checked) {
                handleCheckAnswer();
              }
            }}
          />
          <button
            className="btn-check"
            type="button"
            onClick={handleCheckAnswer}
            disabled={currentResponse.checked}
          >
            {currentResponse.checked ? "Resposta salva" : "Verificar"}
          </button>
        </div>

        {uiError ? <div className="alert-box">{uiError}</div> : null}

        {currentResponse.checked ? (
          <div className={`feedback ${currentResponse.correct ? "ok" : "err"}`}>
            {currentResponse.correct ? (
              <strong>Correto.</strong>
            ) : (
              <strong>Nao desta vez.</strong>
            )}{" "}
            Sua resposta foi {currentResponse.answer || "-"} e o valor esperado e{" "}
            {formatNumber(currentResponse.expected, 4)}{" "}
            {getQuestionUnit(currentQuestion.type)}.

            <div className="fb-steps">
              {currentResponse.steps.map((step) => (
                <div key={step}>{step}</div>
              ))}
            </div>
          </div>
        ) : null}

        <button className="btn-next show" type="button" onClick={handleNextQuestion}>
          {activeSimulation.currentIndex + 1 < activeSimulation.questionCount
            ? "Salvar e ir para a proxima"
            : "Finalizar simulacao"}
        </button>
      </section>
    </div>
  );
}
