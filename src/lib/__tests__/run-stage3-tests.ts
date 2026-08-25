import { aiService } from "../ai/ai-service";
import { parseTextGabarito } from "../ocr/gabarito-parser";
import { MockOCRProvider } from "../ocr/ocr-provider";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runStage3Tests() {
  console.log("\n🧪 Running Stage 3 AI, OCR & Gabarito Tests...\n");

  // 1. Text Gabarito Parser Tests
  const rawInput = `
    01-A
    02 - C
    3. D
    4: B
    5 = E
    6, A
    7 C
    08-B
    9-D
    10 - E
  `;

  const parsed = parseTextGabarito(rawInput);
  console.log(`Parsed Gabarito: ${parsed.totalParsed} questions recognized.`);
  assert(parsed.totalParsed === 10, "Should parse all 10 different format questions");
  assert(parsed.items[0].alternative === "A", "Question 1 is A");
  assert(parsed.items[1].alternative === "C", "Question 2 is C");
  assert(parsed.items[2].alternative === "D", "Question 3 is D");
  assert(parsed.items[4].alternative === "E", "Question 5 is E");
  assert(parsed.unrecognizedLines.length === 0, "No lines failed parsing");

  // 2. OCR Provider Tests
  const ocrProvider = new MockOCRProvider();
  const ocrResult = await ocrProvider.processExamPage("mock_image_base64");
  console.log(`OCR Provider Result: ${ocrResult.detectedAnswers.length} answers detected, overall confidence = ${ocrResult.overallConfidence * 100}%`);
  assert(ocrResult.detectedAnswers.length === 10, "OCR extracted 10 items");
  assert(ocrResult.detectedAnswers[2].confidence === 0.52, "Item 3 has 52% confidence (low confidence marker)");
  assert(ocrResult.detectedAnswers[2].needsManualConfirmation === true, "Item 3 flagged for manual confirmation");

  // 3. AI Service - Error Diagnosis with Zod validation
  const diagnosis = await aiService.diagnoseError({
    questionStatement: "Um cilindro circular reto possui raio 4cm e altura 10cm...",
    discipline: "Matemática",
    subject: "Geometria Espacial",
    studentAnswer: "B",
    correctAnswer: "D",
    alternatives: [
      { letter: "A", text: "80π cm³" },
      { letter: "B", text: "160π cm³" },
      { letter: "C", text: "120π cm³" },
      { letter: "D", text: "160π cm³" },
      { letter: "E", text: "320π cm³" },
    ],
  });

  console.log(`AI Error Diagnosis: Taxonomy = ${diagnosis.errorTaxonomy}`);
  console.log(`Probable Cause: ${diagnosis.probableCause}`);
  console.log(`What To Study: ${diagnosis.whatToStudy}`);
  assert(!!diagnosis.errorTaxonomy, "Diagnosis taxonomy is valid and defined");
  assert(diagnosis.whatToStudy.length > 10, "What to study recommendation is detailed");

  // 4. AI Service - Adaptive Flashcard Generation
  const flashcardBatch = await aiService.generateAdaptiveFlashcards({
    subject: "Geometria Espacial",
    subsubject: "Tronco de Pirâmide",
    conceptualGap: "Confusão entre razão de semelhança linear k e razão volumétrica k³",
    errorCount: 3,
  });

  console.log(`Generated ${flashcardBatch.cards.length} smart flashcards.`);
  assert(flashcardBatch.cards.length >= 2, "Generated at least 2 targeted flashcards");
  assert(flashcardBatch.cards[0].cardType === "FORMULA" || flashcardBatch.cards[0].cardType === "ARMADILHAS_ENEM", "Card types are valid");

  console.log("\n🎉 All Stage 3 AI & OCR tests passed successfully!\n");
}

runStage3Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
