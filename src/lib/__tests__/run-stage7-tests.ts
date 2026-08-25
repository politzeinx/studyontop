import { SEED_FLASHCARDS } from "../data/flashcards-seed";
import { scheduleNextReview } from "../statistics/fsrs-engine";
import { CardStage } from "@prisma/client";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runStage7Tests() {
  console.log("\n🧪 Running Stage 7 Smart Flashcards & SRS Tests...\n");

  // 1. Seed Flashcards Validation
  assert(SEED_FLASHCARDS.length >= 6, "Seed contains at least 6 flashcards");
  const continuousCards = SEED_FLASHCARDS.filter((c) => c.isContinuousRevision);
  assert(continuousCards.length >= 2, "Includes continuous revision cards (Química Orgânica)");
  console.log(`✅ Passed: Continuous revision deck identified (${continuousCards.length} cards).`);

  // 2. FSRS Transitions Test
  const orgCard = continuousCards[0];
  const ratedGood = scheduleNextReview(
    {
      repetitionCount: orgCard.repetitionCount,
      intervalDays: orgCard.intervalDays,
      easeFactor: orgCard.easeFactor,
      stability: orgCard.stability,
      difficulty: orgCard.difficultyRating,
      stage: orgCard.stage,
      successStreak: orgCard.successStreak,
      failureCount: orgCard.failureCount,
      isContinuousRevision: orgCard.isContinuousRevision,
    },
    3
  );

  console.log(`Card Review Good: Stage=${ratedGood.stage}, Interval=${ratedGood.intervalDays} days, Note="${ratedGood.stageTransitionNote}"`);
  assert(ratedGood.stage === CardStage.MANUTENCAO, "Continuous revision card stays in MANUTENCAO");
  assert(ratedGood.intervalDays <= 21, "Maintains ceiling on max interval for continuous revision");

  // 3. FSRS Failure (Regress to Consolidation)
  const ratedFail = scheduleNextReview(
    {
      repetitionCount: orgCard.repetitionCount,
      intervalDays: orgCard.intervalDays,
      easeFactor: orgCard.easeFactor,
      stability: orgCard.stability,
      difficulty: orgCard.difficultyRating,
      stage: orgCard.stage,
      successStreak: orgCard.successStreak,
      failureCount: orgCard.failureCount,
      isContinuousRevision: orgCard.isContinuousRevision,
    },
    1
  );

  console.log(`Card Review Again: Stage=${ratedFail.stage}, Interval=${ratedFail.intervalDays} days, Note="${ratedFail.stageTransitionNote}"`);
  assert(ratedFail.stage === CardStage.CONSOLIDANDO, "Failing card regresses to CONSOLIDANDO");
  assert(ratedFail.intervalDays === 0.5, "Interval resets to 0.5 days on failure");

  console.log("\n🎉 All Stage 7 Flashcards & SRS tests passed successfully!\n");
}

runStage7Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
