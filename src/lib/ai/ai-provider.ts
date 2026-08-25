import { z } from "zod";

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface IAIProvider {
  readonly providerName: string;

  /**
   * Gera uma resposta estruturada e validada por schema Zod
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T>;

  /**
   * Gera texto livre
   */
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;
}

/**
 * Provider Mock para desenvolvimento local, CI/CD e fallback resiliente
 */
export class MockAIProvider implements IAIProvider {
  readonly providerName = "MockAIProvider";

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const promptLower = prompt.toLowerCase();

    // Mock para Diagnóstico de Erro
    if (promptLower.includes("diagnosticar erro") || promptLower.includes("motivo provável")) {
      const mockDiagnosis = {
        errorTaxonomy: "ERRO_CONCEITUAL",
        probableCause:
          "O estudante confundiu a aplicação da razão de semelhança linear com a razão volumétrica (k³), resultando no cálculo incorreto do volume do tronco.",
        whatToStudy:
          "Geometria Espacial: Tronco de Pirâmide, Proporcionalidade de Volumes e Relações de Semelhança no ENEM.",
        distractorTrap:
          "A alternativa B utilizou a razão quadrática k² (área) em vez de k³ (volume).",
        conceptualGap:
          "Diferenciação entre escalas lineares, superficiais e volumétricas em figuras tridimensionais.",
      };
      return schema.parse(mockDiagnosis);
    }

    // Mock para Geração de Flashcards
    if (promptLower.includes("flashcard") || promptLower.includes("gerar cartões")) {
      const mockFlashcards = {
        cards: [
          {
            subject: "Geometria Espacial",
            subsubject: "Tronco de Cone e Pirâmide",
            cardType: "FORMULA",
            frontContent:
              "Se dois sólidos geométricos são semelhantes com razão linear 'k', qual é a razão entre seus volumes?",
            backContent:
              "A razão entre os volumes é k³ (V₁ / V₂ = k³). Lembre-se: comprimentos variam com k, áreas com k² e volumes com k³.",
            keyTakeaway: "Volumes sempre obedecem à terceira potência da razão linear.",
          },
          {
            subject: "Geometria Espacial",
            subsubject: "Prismas e Cilindros",
            cardType: "ARMADILHAS_ENEM",
            frontContent:
              "Qual a armadilha mais comum no ENEM em questões de capacidade de embalagens cilíndricas?",
            backContent:
              "Confundir o raio da base com o diâmetro fornecido no enunciado, além de esquecer a conversão de cm³ para Litros (1.000 cm³ = 1 L).",
            keyTakeaway: "Sempre divida o diâmetro por 2 antes de calcular π·r²·h.",
          },
        ],
        synthesisNote:
          "Cartões gerados para sanar lacunas de escala volumétrica e conversão de unidades.",
      };
      return schema.parse(mockFlashcards);
    }

    // Fallback genérico tentando extrair JSON
    throw new Error(`MockAIProvider não possui mock predefinido para o schema fornecido.`);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    return `[MockAI Response] Análise pedagógica processada com sucesso para: "${prompt.slice(0, 50)}..."`;
  }
}

/**
 * Provider Google Gemini API (gemini-1.5-pro / gemini-1.5-flash / gemini-2.0)
 */
export class GoogleGeminiProvider implements IAIProvider {
  readonly providerName = "GoogleGeminiProvider";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "gemini-1.5-flash") {
    this.apiKey = apiKey || process.env.AI_API_KEY || "";
    this.modelName = modelName;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      const mock = new MockAIProvider();
      return mock.generateStructured(prompt, schema, options);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const systemPrompt = `${options?.systemInstruction || "Você é o motor de Inteligência Artificial pedagógica da plataforma StudyOnTop especializada no ENEM."}
IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido, sem formatações Markdown adicionais, estritamente de acordo com o esquema solicitado.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Google Gemini API retornou resposta vazia.");
    }

    const parsedJson = JSON.parse(rawText);
    return schema.parse(parsedJson);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    if (!this.apiKey || this.apiKey.startsWith("mock_")) {
      return new MockAIProvider().generateText(prompt, options);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}
