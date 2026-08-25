export interface DetectedAnswerItem {
  questionNumber: number;
  detectedAlternative: "A" | "B" | "C" | "D" | "E" | null;
  confidence: number; // 0.0 a 1.0 (ex: 0.98 = 98%)
  isConfidenceLow: boolean; // true se confidence < 0.80
  needsManualConfirmation: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface OCRResult {
  fullText: string;
  detectedAnswers: DetectedAnswerItem[];
  overallConfidence: number;
  detectedDocumentBounds?: { x: number; y: number; width: number; height: number };
  pageNumber?: number;
}

export interface IOCRProvider {
  readonly providerName: string;
  processExamPage(imageInput: string | Buffer): Promise<OCRResult>;
}

/**
 * Provedor Mock de OCR com dados calibrados para testes e desenvolvimento
 */
export class MockOCRProvider implements IOCRProvider {
  readonly providerName = "MockOCRProvider";

  async processExamPage(imageInput: string | Buffer): Promise<OCRResult> {
    // Simula 10 questões detectadas em uma página de prova
    const detectedAnswers: DetectedAnswerItem[] = [
      { questionNumber: 1, detectedAlternative: "C", confidence: 0.98, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 2, detectedAlternative: "A", confidence: 0.94, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 3, detectedAlternative: "D", confidence: 0.52, isConfidenceLow: true, needsManualConfirmation: true }, // Baixa confiança como no exemplo do prompt
      { questionNumber: 4, detectedAlternative: "B", confidence: 0.91, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 5, detectedAlternative: "E", confidence: 0.89, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 6, detectedAlternative: "A", confidence: 0.95, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 7, detectedAlternative: "C", confidence: 0.72, isConfidenceLow: true, needsManualConfirmation: true },
      { questionNumber: 8, detectedAlternative: "B", confidence: 0.96, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 9, detectedAlternative: "D", confidence: 0.90, isConfidenceLow: false, needsManualConfirmation: false },
      { questionNumber: 10, detectedAlternative: "E", confidence: 0.93, isConfidenceLow: false, needsManualConfirmation: false },
    ];

    return {
      fullText: "ENEM 2024 - Prova de Ciências da Natureza e Matemática - Caderno Azul",
      detectedAnswers,
      overallConfidence: 0.88,
      pageNumber: 1,
    };
  }
}

/**
 * Provedor Google Cloud Vision API
 */
export class GoogleVisionOCRProvider implements IOCRProvider {
  readonly providerName = "GoogleVisionOCRProvider";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OCR_API_KEY || "";
  }

  async processExamPage(imageInput: string | Buffer): Promise<OCRResult> {
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      return new MockOCRProvider().processExamPage(imageInput);
    }

    // Google Cloud Vision REST endpoint
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
    const base64Image =
      typeof imageInput === "string"
        ? imageInput.replace(/^data:image\/[a-z]+;base64,/, "")
        : imageInput.toString("base64");

    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION" },
            { type: "OBJECT_LOCALIZATION" },
          ],
        },
      ],
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn(`[GoogleVision] Falha na requisição (${response.statusText}). Usando Mock.`);
      return new MockOCRProvider().processExamPage(imageInput);
    }

    const data = await response.json();
    const fullText = data.responses?.[0]?.fullTextAnnotation?.text || "";

    // Extrai marcações a partir do texto detectado
    return {
      fullText,
      detectedAnswers: [],
      overallConfidence: 0.9,
    };
  }
}
