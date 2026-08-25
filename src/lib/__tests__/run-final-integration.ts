import { SEED_QUESTIONS } from "../data/questions-seed";
import { SEED_FLASHCARDS } from "../data/flashcards-seed";
import { calculateSimulationTRI } from "../tri/tri-engine";
import { analyzeResponseConsistency } from "../tri/consistency";
import { scheduleNextReview } from "../statistics/fsrs-engine";
import { recalculateDomainScore } from "../statistics/domain-engine";
import { calculatePriorityIndex } from "../recommendations/priority-engine";
import { executeCorrection, inferErrorTaxonomy } from "@/services/correction/correction-engine";
import { generateSimulation } from "@/services/simulation/simulation-generator";
import { generateAdaptiveStudyPlan } from "@/services/study-plan/study-plan-generator";
import { parseTextGabarito } from "../ocr/gabarito-parser";
import { KnowledgeArea, SimulationType, ErrorTaxonomy } from "@/types";
import { CardStage } from "@prisma/client";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  }
}

function section(name: string) {
  console.log(`\n━━━ ${name} ━━━`);
}

async function runFinalIntegrationTests() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║   StudyOnTop — Suíte Final de Testes de Integração (E2E)   ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // ═══════════════════════════════════════
  // 1. MOTOR TRI 3PL (Etapa 2)
  // ═══════════════════════════════════════
  section("1. Motor TRI 3PL — Estimação Bayesiana EAP");
  const triItems = [
    { questionId: "q1", isCorrect: true, isBlank: false, isCancelled: false, triParams: { a: 1.5, b: -0.5, c: 0.2, hasOfficialTri: false }, difficulty: "FACIL" as const },
    { questionId: "q2", isCorrect: true, isBlank: false, isCancelled: false, triParams: { a: 1.2, b: 0.5, c: 0.2, hasOfficialTri: false }, difficulty: "MEDIA" as const },
    { questionId: "q3", isCorrect: false, isBlank: false, isCancelled: false, triParams: { a: 1.8, b: 1.5, c: 0.2, hasOfficialTri: false }, difficulty: "DIFICIL" as const },
  ];
  const triResult = calculateSimulationTRI(triItems, "MATEMATICA");
  assert(triResult.enemScaleScore >= 400 && triResult.enemScaleScore <= 1000, `TRI score in ENEM range: ${triResult.enemScaleScore}`);
  assert(triResult.isPlatformEstimate === true, "Platform estimate flag active");

  // ═══════════════════════════════════════
  // 2. CONSISTÊNCIA PEDAGÓGICA (Etapa 2)
  // ═══════════════════════════════════════
  section("2. Consistência Pedagógica");
  const consistency = analyzeResponseConsistency(triItems);
  assert(consistency.consistencyScore >= 0 && consistency.consistencyScore <= 1.0, `Consistency score valid: ${consistency.consistencyScore}`);

  // ═══════════════════════════════════════
  // 3. FSRS / SM-2 (Etapa 2 + 7)
  // ═══════════════════════════════════════
  section("3. Algoritmo FSRS / SM-2 — Revisão Espaçada");
  const goodReview = scheduleNextReview(
    { repetitionCount: 3, intervalDays: 7, easeFactor: 2.5, stability: 8, difficulty: 5, stage: CardStage.CONSOLIDANDO, successStreak: 3, failureCount: 0, isContinuousRevision: false },
    3
  );
  assert(goodReview.intervalDays > 7, `Good rating increases interval: ${goodReview.intervalDays} days`);

  const failReview = scheduleNextReview(
    { repetitionCount: 5, intervalDays: 14, easeFactor: 2.6, stability: 12, difficulty: 4, stage: CardStage.MANUTENCAO, successStreak: 5, failureCount: 0, isContinuousRevision: true },
    1
  );
  assert(failReview.stage === CardStage.CONSOLIDANDO, "Failure regresses card to CONSOLIDANDO");
  assert(failReview.intervalDays === 0.5, "Failure resets interval to 0.5 days");

  // ═══════════════════════════════════════
  // 4. DOMÍNIO E PRIORIDADE (Etapa 2)
  // ═══════════════════════════════════════
  section("4. Domínio e Motor de Prioridade");
  const domainResult = recalculateDomainScore({
    previousScore: 50,
    totalQuestions: 10,
    totalCorrect: 7,
    easyErrors: 0,
    mediumErrors: 2,
    hardErrors: 1,
    consistencyScore: 0.85,
    recentAttempts: [
      { isCorrect: true, difficulty: "FACIL" },
      { isCorrect: true, difficulty: "MEDIA" },
      { isCorrect: false, difficulty: "DIFICIL" },
    ],
  });
  assert(domainResult.newScore >= 0 && domainResult.newScore <= 100, `Domain score valid: ${domainResult.newScore}`);

  const priority = calculatePriorityIndex({
    subject: "Geometria Espacial",
    area: KnowledgeArea.MATEMATICA,
    domainScore: 30,
    accuracyRate: 40,
    totalQuestions: 18,
    recentErrorsCount: 4,
    recurrenceScoreEnemRecent: 0.9,
  });
  assert(priority.priorityIndex > 70, `High-gain subject detected: priority=${priority.priorityIndex}`);

  // ═══════════════════════════════════════
  // 5. PARSER DE GABARITO / OCR (Etapa 3)
  // ═══════════════════════════════════════
  section("5. Parser de Gabarito (Múltiplos Formatos)");
  const parsed1 = parseTextGabarito("01-A\n02-B\n03-C\n04-D\n05-E");
  assert(parsed1.items.length === 5, `Parsed 5 answers from dash format`);
  assert(parsed1.items[0].alternative === "A" && parsed1.items[4].alternative === "E", "Correct answers extracted");

  const parsed2 = parseTextGabarito("1. A\n2. B\n3. C");
  assert(parsed2.items.length === 3, `Parsed 3 answers from dot format`);

  // ═══════════════════════════════════════
  // 6. BANCO DE QUESTÕES SEED (Etapa 5)
  // ═══════════════════════════════════════
  section("6. Banco de Questões ENEM & Seed");
  assert(SEED_QUESTIONS.length >= 6, `Seed contains ${SEED_QUESTIONS.length} questions`);
  SEED_QUESTIONS.forEach((q) => {
    assert(q.alternatives.length === 5, `Q ${q.id}: has 5 alternatives`);
    assert(q.triParamA! > 0, `Q ${q.id}: valid TRI param A`);
  });

  // ═══════════════════════════════════════
  // 7. GERADOR DE SIMULADOS (Etapa 5)
  // ═══════════════════════════════════════
  section("7. Gerador de Simulados Adaptativos");
  const adaptiveSim = generateSimulation({
    type: SimulationType.ADAPTATIVO,
    area: KnowledgeArea.MATEMATICA,
    questionCount: 6,
    weakSubjects: ["Geometria Espacial"],
  });
  assert(adaptiveSim.questions.length === 6, `Adaptive sim generated ${adaptiveSim.questions.length} questions`);

  // ═══════════════════════════════════════
  // 8. MOTOR DE CORREÇÃO (Etapa 6)
  // ═══════════════════════════════════════
  section("8. Motor de Correção & Taxonomia de Erros");
  const q = SEED_QUESTIONS;
  const correction = executeCorrection({
    simulationId: "final-test",
    questions: [q[0], q[1], q[2]],
    studentAnswers: { [q[0].id]: q[0].correctAlternative, [q[1].id]: "X", [q[2].id]: null },
    cancelledQuestionIds: [],
  });
  assert(correction.correctCount === 1, "1 correct");
  assert(correction.wrongCount === 1, "1 wrong");
  assert(correction.blankCount === 1, "1 blank");
  assert(correction.triResult.enemScaleScore >= 400, `TRI recalculated: ${correction.triResult.enemScaleScore}`);

  const taxResult = inferErrorTaxonomy(q[0], "C");
  assert(Object.values(ErrorTaxonomy).includes(taxResult.taxonomy), "Valid taxonomy returned");

  // ═══════════════════════════════════════
  // 9. FLASHCARDS SEED (Etapa 7)
  // ═══════════════════════════════════════
  section("9. Flashcards Inteligentes & Seed");
  assert(SEED_FLASHCARDS.length >= 6, `${SEED_FLASHCARDS.length} flashcards seeded`);
  const continuousCards = SEED_FLASHCARDS.filter((c) => c.isContinuousRevision);
  assert(continuousCards.length >= 2, `Continuous revision cards: ${continuousCards.length}`);

  // ═══════════════════════════════════════
  // 10. PLANO DE ESTUDOS ADAPTATIVO (Etapa 8)
  // ═══════════════════════════════════════
  section("10. Plano de Estudos Adaptativo");
  const plan = generateAdaptiveStudyPlan(
    { studyHoursPerDay: 3, studyDaysPerWeek: 6, targetCourse: "Medicina" },
    [
      { subject: "Geometria Espacial", area: KnowledgeArea.MATEMATICA, domainScore: 35, accuracyRate: 40, totalQuestions: 18, recentErrorsCount: 3, recurrenceScoreEnemRecent: 0.9 },
      { subject: "Química Orgânica", area: KnowledgeArea.NATUREZA, domainScore: 74, accuracyRate: 83, totalQuestions: 24, recentErrorsCount: 1, recurrenceScoreEnemRecent: 0.95, isContinuousRevision: true },
    ]
  );
  assert(plan.weeklyTargetHours === 18, "Weekly target = 18h");
  assert(plan.dailySchedules.length === 7, "7-day schedule generated");
  const hasSRS = plan.dailySchedules[0].blocks.some((b) => b.type === "FLASHCARDS");
  assert(hasSRS, "Daily SRS flashcard block present");

  // ═══════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║   RESULTADO FINAL: ${passed} passed, ${failed} failed                   ║`);
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (failed > 0) {
    console.error(`\n⚠️  ${failed} testes falharam. Revisar antes do deploy.\n`);
    process.exit(1);
  } else {
    console.log(`\n🎉 Todos os ${passed} testes passaram! Plataforma pronta para deploy.\n`);
  }
}

runFinalIntegrationTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
