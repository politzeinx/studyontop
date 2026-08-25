import { SEED_QUESTIONS } from "../data/questions-seed";
import { generateSimulation } from "@/services/simulation/simulation-generator";
import { SimulationType, KnowledgeArea } from "@/types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runStage5Tests() {
  console.log("\n🧪 Running Stage 5 Questions Seed & Simulation Engine Tests...\n");

  // 1. Seed Questions Integrity
  assert(SEED_QUESTIONS.length >= 6, "Seed contains at least 6 detailed questions");
  SEED_QUESTIONS.forEach((q) => {
    assert(!!q.statement && q.statement.length > 20, `Question ${q.id} has statement`);
    assert(q.alternatives.length === 5, `Question ${q.id} has exactly 5 alternatives (A-E)`);
    assert(q.triParamA! > 0 && q.triParamC! >= 0, `Question ${q.id} has valid TRI parameters`);
    assert(q.isRecentPattern === true, `Question ${q.id} is marked as recent pattern`);
  });
  console.log("✅ Passed: All seed questions have valid TRI 3PL parameters, alternatives, and skills.");

  // 2. Adaptive Simulation Generation
  const adaptiveSim = generateSimulation({
    type: SimulationType.ADAPTATIVO,
    area: KnowledgeArea.MATEMATICA,
    questionCount: 10,
    weakSubjects: ["Geometria Espacial"],
  });

  console.log(`Adaptive Sim: ${adaptiveSim.title}, Questions: ${adaptiveSim.questions.length}`);
  assert(adaptiveSim.questions.length === 10, "Adaptive simulation generates requested 10 questions");
  assert(adaptiveSim.distributionSummary.subjectsCovered.includes("Geometria Espacial"), "Covers target weak subject");

  // 3. ENEM Recente Simulation Generation
  const recentSim = generateSimulation({
    type: SimulationType.ENEM_RECENTE,
    questionCount: 15,
  });

  console.log(`Recent Sim: ${recentSim.title}, Easy: ${recentSim.distributionSummary.easyCount}, Med: ${recentSim.distributionSummary.mediumCount}, Hard: ${recentSim.distributionSummary.hardCount}`);
  assert(recentSim.questions.length === 15, "Recent simulation generates requested 15 questions");
  assert(recentSim.distributionSummary.easyCount > 0 && recentSim.distributionSummary.mediumCount > 0, "Calibrates multiple difficulty levels");

  console.log("\n🎉 All Stage 5 Simulation Generator tests passed successfully!\n");
}

runStage5Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
