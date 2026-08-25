import { executeCorrection, inferErrorTaxonomy } from "@/services/correction/correction-engine";
import { SEED_QUESTIONS } from "../data/questions-seed";
import { AnswerStatus, ErrorTaxonomy } from "@/types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runStage6Tests() {
  console.log("\n🧪 Running Stage 6 Correction Engine & Error Bank Tests...\n");

  const q1 = SEED_QUESTIONS[0]; // Geometria Espacial (Gabarito B, Cálculo)
  const q2 = SEED_QUESTIONS[1]; // Tronco de Pirâmide (Gabarito A, Difícil)
  const q3 = SEED_QUESTIONS[2]; // Química Orgânica (Gabarito B)
  const q5 = SEED_QUESTIONS[4]; // Ecologia (Gabarito B, Fácil)

  // 1. Teste de Inferência de Taxonomia
  const taxCalculo = inferErrorTaxonomy(q1, "C");
  assert(taxCalculo.taxonomy === ErrorTaxonomy.CALCULO, "Calculation question error inferred as CALCULO");

  const taxAtencao = inferErrorTaxonomy(q5, "A");
  assert(taxAtencao.taxonomy === ErrorTaxonomy.ATENCAO, "Easy question error inferred as ATENCAO");

  const taxFaltaConhecimento = inferErrorTaxonomy(q2, "C");
  assert(taxFaltaConhecimento.taxonomy === ErrorTaxonomy.FALTA_CONHECIMENTO, "Hard question error inferred as FALTA_CONHECIMENTO");

  // 2. Execução da Correção com Anulação
  const mockStudentAnswers = {
    [q1.id]: "B", // Correta
    [q2.id]: "C", // Errada
    [q3.id]: null, // Em Branco
    [q5.id]: "A", // Anulada (passada em cancelledQuestionIds)
  };

  const correction = executeCorrection({
    simulationId: "test-sim",
    questions: [q1, q2, q3, q5],
    studentAnswers: mockStudentAnswers,
    cancelledQuestionIds: [q5.id],
  });

  console.log(`Correction Results: Correct=${correction.correctCount}, Wrong=${correction.wrongCount}, Blank=${correction.blankCount}, Cancelled=${correction.cancelledCount}`);
  assert(correction.correctCount === 1, "1 question correct");
  assert(correction.wrongCount === 1, "1 question wrong");
  assert(correction.blankCount === 1, "1 question blank");
  assert(correction.cancelledCount === 1, "1 question cancelled (anulada)");
  assert(correction.validQuestionsCount === 3, "Valid questions excludes cancelled (3 total)");
  assert(Math.abs(correction.accuracyPercentage - 33.3) < 0.5, "Accuracy calculated over valid questions (33.3%)");
  assert(correction.triResult.enemScaleScore > 400, "TRI score successfully calculated");
  assert(correction.generatedErrorBankCount === 2, "Generated error bank items for wrong and blank");

  // 3. Teste de Recálculo após Alteração Manual do Aluno
  const recalculatedAnswers = {
    ...mockStudentAnswers,
    [q2.id]: "A", // Aluno corrigiu Q2 para a alternativa certa
  };

  const recalculated = executeCorrection({
    simulationId: "test-sim",
    questions: [q1, q2, q3, q5],
    studentAnswers: recalculatedAnswers,
    cancelledQuestionIds: [q5.id],
  });

  assert(recalculated.correctCount === 2, "After manual edit, correct count is 2");
  assert(recalculated.triResult.enemScaleScore > correction.triResult.enemScaleScore, "TRI score increased after turning wrong answer to correct");

  console.log("\n🎉 All Stage 6 Correction & Error Bank tests passed successfully!\n");
}

runStage6Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
