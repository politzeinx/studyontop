import { detectDocumentCorners } from "../scanner/image-processing";
import { MockOCRProvider } from "../ocr/ocr-provider";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${msg}`);
  }
}

async function runScannerTests() {
  console.log("\n🧪 Running Stage 4 Scanner & Image Processing Tests...\n");

  // 1. Document corners calculation
  const corners1080p = detectDocumentCorners(1920, 1080);
  assert(corners1080p.topLeft.x > 0 && corners1080p.topLeft.y > 0, "Top left corner has safe margin");
  assert(corners1080p.bottomRight.x < 1920 && corners1080p.bottomRight.y < 1080, "Bottom right corner is within bounds");

  // 2. OCR and Confidence Level Verification (Items 2 & 3 from Master Prompt)
  const provider = new MockOCRProvider();
  const result = await provider.processExamPage("test_exam_sheet");

  const q1 = result.detectedAnswers.find((a) => a.questionNumber === 1);
  const q3 = result.detectedAnswers.find((a) => a.questionNumber === 3);

  assert(q1?.detectedAlternative === "C" && q1.confidence === 0.98, "Questão 01 is C with 98% confidence");
  assert(q3?.confidence === 0.52, "Questão 03 is flagged with 52% low confidence");
  assert(q3?.needsManualConfirmation === true, "Questão 03 requires manual confirmation");
  assert(q3?.isConfidenceLow === true, "isConfidenceLow is marked true when confidence < 80%");

  console.log("\n🎉 All Stage 4 Scanner tests passed successfully!\n");
}

runScannerTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
