import { calculateProbability3PL, estimateThetaEAP, calculateSimulationTRI, convertThetaToEnemScale } from "../tri/tri-engine";
import { analyzeResponseConsistency } from "../tri/consistency";
import { scheduleNextReview, calculateRetrievability } from "../statistics/fsrs-engine";
import { calculatePriorityIndex, determineBestNextStudyAction } from "../recommendations/priority-engine";
import { recalculateDomainScore } from "../statistics/domain-engine";
import { CardStage, KnowledgeArea, GainPotential, PriorityLevel } from "@prisma/client";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

console.log("\n🧪 Running StudyOnTop Engine Validations...\n");

// 1. TRI 3PL Probability tests
const p1 = calculateProbability3PL(0.0, 1.2, 0.0, 0.2);
assert(Math.abs(p1 - 0.6) < 0.01, `P(theta=0, a=1.2, b=0, c=0.2) should be 0.60 (got ${p1})`);

const pEasy = calculateProbability3PL(2.0, 1.2, 0.0, 0.2);
assert(pEasy > 0.95, `High theta should have probability > 0.95 (got ${pEasy})`);

const pChute = calculateProbability3PL(-4.0, 1.2, 0.0, 0.2);
assert(Math.abs(pChute - 0.2) < 0.02, `Very low theta should approach guessing parameter c=0.2 (got ${pChute})`);

// 2. TRI Simulation EAP estimation
const mockExamResponses = [
  // Fáceis (acertou)
  { questionId: "q1", isCorrect: true, difficulty: "FACIL" as const, triParams: { a: 1.0, b: -1.5, c: 0.2, hasOfficialTri: true } },
  { questionId: "q2", isCorrect: true, difficulty: "FACIL" as const, triParams: { a: 1.1, b: -1.2, c: 0.2, hasOfficialTri: true } },
  { questionId: "q3", isCorrect: true, difficulty: "FACIL" as const, triParams: { a: 1.0, b: -1.0, c: 0.2, hasOfficialTri: true } },
  // Médias (acertou maioria)
  { questionId: "q4", isCorrect: true, difficulty: "MEDIA" as const, triParams: { a: 1.3, b: 0.0, c: 0.2, hasOfficialTri: true } },
  { questionId: "q5", isCorrect: true, difficulty: "MEDIA" as const, triParams: { a: 1.2, b: 0.2, c: 0.2, hasOfficialTri: true } },
  { questionId: "q6", isCorrect: false, difficulty: "MEDIA" as const, triParams: { a: 1.4, b: 0.4, c: 0.2, hasOfficialTri: true } },
  // Difíceis (errou maioria)
  { questionId: "q7", isCorrect: false, difficulty: "DIFICIL" as const, triParams: { a: 1.6, b: 1.2, c: 0.2, hasOfficialTri: true } },
  { questionId: "q8", isCorrect: false, difficulty: "DIFICIL" as const, triParams: { a: 1.7, b: 1.5, c: 0.2, hasOfficialTri: true } },
  { questionId: "q9", isCorrect: true, difficulty: "DIFICIL" as const, triParams: { a: 1.8, b: 1.8, c: 0.2, hasOfficialTri: true } },
];

const triResult = calculateSimulationTRI(mockExamResponses, "MATEMATICA");
console.log(`TRI Result: Theta=${triResult.theta.toFixed(2)}, Score ENEM=${triResult.enemScaleScore}, Accuracy=${triResult.accuracyPercentage}%`);
assert(triResult.enemScaleScore >= 500 && triResult.enemScaleScore <= 850, "Calculated ENEM score is within realistic bounds");
assert(triResult.isPlatformEstimate === true, "isPlatformEstimate flag is correctly set to true");

// 3. Consistency Analysis
const consistency = analyzeResponseConsistency(mockExamResponses);
console.log(`Consistency Score: ${consistency.consistencyScore * 100}% (${consistency.coherenceLevel})`);
assert(consistency.consistencyScore >= 0.75, "Monotonic response pattern achieves good consistency");
assert(consistency.easyAccuracy === 100, "Easy accuracy calculated correctly");

// 4. FSRS / SRS Engine tests
const initialCard = {
  repetitionCount: 0,
  intervalDays: 1.0,
  easeFactor: 2.5,
  stability: 1.0,
  difficulty: 5.0,
  stage: CardStage.NOVO,
  successStreak: 0,
  failureCount: 0,
  isContinuousRevision: false,
};

const afterGood = scheduleNextReview(initialCard, 3);
assert(afterGood.stage === CardStage.APRENDENDO, "First Good moves card to APRENDENDO");
assert(afterGood.intervalDays >= 1.0, "Interval is at least 1 day");

const afterFail = scheduleNextReview(
  {
    ...initialCard,
    intervalDays: afterGood.intervalDays,
    stability: afterGood.stability,
    difficulty: afterGood.difficulty,
    easeFactor: afterGood.easeFactor,
    stage: CardStage.DOMINADO,
  },
  1
);
assert(afterFail.stage === CardStage.CONSOLIDANDO, "Failing a DOMINADO card regresses it to CONSOLIDANDO");
assert(afterFail.intervalDays === 0.5, "Failed card resets interval to 0.5 days");

// 5. Continuous revision for Química Orgânica
const orgChemistryCard = {
  ...initialCard,
  stage: CardStage.DOMINADO,
  successStreak: 6,
  isContinuousRevision: true,
};
const afterContinuous = scheduleNextReview(orgChemistryCard, 4);
assert(afterContinuous.stage === CardStage.MANUTENCAO, "Continuous revision subjects enter MANUTENCAO without disappearing");
assert(afterContinuous.intervalDays <= 21, "Continuous revision maintains a ceiling on maximum intervals");

// 6. Priority Engine tests
const priorityResult = calculatePriorityIndex({
  subject: "Geometria Espacial",
  area: KnowledgeArea.MATEMATICA,
  domainScore: 35,
  accuracyRate: 40,
  totalQuestions: 15,
  recentErrorsCount: 3,
  recurrenceScoreEnemRecent: 0.85,
});

console.log(`Priority Index for Geometria Espacial: ${priorityResult.priorityIndex} (${priorityResult.priorityLevel}), Gain: ${priorityResult.gainPotential}`);
assert(priorityResult.priorityLevel === PriorityLevel.MUITO_ALTA, "Low domain + high recurrence yields MUITO_ALTA priority");
assert(priorityResult.gainPotential === GainPotential.MUITO_ALTO, "Gain potential is MUITO_ALTO");

// 7. Best Next Study Action
const bestAction = determineBestNextStudyAction([
  {
    subject: "Geometria Espacial",
    area: KnowledgeArea.MATEMATICA,
    domainScore: 35,
    accuracyRate: 40,
    totalQuestions: 15,
    recentErrorsCount: 3,
    recurrenceScoreEnemRecent: 0.85,
  },
  {
    subject: "Porcentagem",
    area: KnowledgeArea.MATEMATICA,
    domainScore: 92,
    accuracyRate: 95,
    totalQuestions: 25,
    recentErrorsCount: 0,
    recurrenceScoreEnemRecent: 0.8,
  },
]);

console.log(`Best Action: "${bestAction.actionTitle}"`);
assert(bestAction.topSubject.subject === "Geometria Espacial", "Best next action accurately targets the highest priority subject");

console.log("\n🎉 All 10 mathematical engine tests passed successfully!\n");
