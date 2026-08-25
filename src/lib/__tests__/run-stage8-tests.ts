import { generateAdaptiveStudyPlan } from "@/services/study-plan/study-plan-generator";
import { KnowledgeArea } from "@/types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runStage8Tests() {
  console.log("\n🧪 Running Stage 8 Study Plan & Dashboard Tests...\n");

  const mockDomainInputs = [
    {
      subject: "Geometria Espacial",
      subsubject: "Prismas e Cilindros",
      area: KnowledgeArea.MATEMATICA,
      domainScore: 35,
      accuracyRate: 40,
      totalQuestions: 18,
      recentErrorsCount: 3,
      recurrenceScoreEnemRecent: 0.9,
    },
    {
      subject: "Termodinâmica",
      subsubject: "Ciclo de Carnot",
      area: KnowledgeArea.NATUREZA,
      domainScore: 48,
      accuracyRate: 50,
      totalQuestions: 14,
      recentErrorsCount: 2,
      recurrenceScoreEnemRecent: 0.85,
    },
    {
      subject: "Química Orgânica",
      subsubject: "Reações e Isomeria",
      area: KnowledgeArea.NATUREZA,
      domainScore: 74,
      accuracyRate: 83,
      totalQuestions: 24,
      recentErrorsCount: 1,
      recurrenceScoreEnemRecent: 0.95,
      isContinuousRevision: true,
    },
  ];

  const plan = generateAdaptiveStudyPlan(
    {
      studyHoursPerDay: 3.0,
      studyDaysPerWeek: 6,
      targetCourse: "Medicina",
    },
    mockDomainInputs
  );

  console.log(`Study Plan: Target = ${plan.weeklyTargetHours}h/week, Schedules = ${plan.dailySchedules.length} days`);
  assert(plan.weeklyTargetHours === 18, "Weekly hours calculated accurately (3h * 6 days = 18h)");
  assert(plan.dailySchedules.length === 7, "7 days of week represented (6 study + 1 rest)");
  
  // Verify SRS block presence on Monday
  const monday = plan.dailySchedules[0];
  const srsBlock = monday.blocks.find((b) => b.type === "FLASHCARDS");
  assert(!!srsBlock, "Daily schedule includes mandatory SRS flashcards review block");
  assert(srsBlock?.durationMinutes === 20, "SRS block is 20 minutes");

  // Verify Saturday has Simulado block
  const saturday = plan.dailySchedules[5];
  const simBlock = saturday.blocks.find((b) => b.type === "SIMULADO");
  assert(!!simBlock, "Saturday schedule contains weekly Simulado / Treino de Ritmo block");

  // Verify Active Study Recommendation targets the highest priority gap
  assert(plan.activeStudyRecommendation.subject === "Geometria Espacial", "Active study recommendation targets Geometria Espacial (highest priority)");

  console.log("\n🎉 All Stage 8 Study Plan tests passed successfully!\n");
}

runStage8Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
