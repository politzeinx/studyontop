import { z } from "zod";
import {
  IAIProvider,
  GoogleGeminiProvider,
  MockAIProvider,
} from "./ai-provider";
import {
  ErrorDiagnosisResponse,
  ErrorDiagnosisResponseSchema,
  GeneratedFlashcardsResponse,
  GeneratedFlashcardsSchema,
} from "@/schemas/ai-schemas";

export class AIService {
  private provider: IAIProvider;

  constructor(provider?: IAIProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      const providerType = process.env.AI_PROVIDER || "google";
      if (providerType === "google") {
        this.provider = new GoogleGeminiProvider();
      } else {
        this.provider = new MockAIProvider();
      }
    }
  }

  /**
   * Executa uma chamada estruturada com retentativas automáticas e validação Zod
   */
  async executeWithRetry<T>(
    operationName: string,
    prompt: string,
    schema: z.ZodType<T>,
    maxRetries = 3
  ): Promise<T> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        return await this.provider.generateStructured(prompt, schema);
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[AIService] Tentativa ${attempt}/${maxRetries} falhou para "${operationName}": ${err.message}`
        );

        if (attempt < maxRetries) {
          // Backoff exponencial: 500ms, 1000ms, 2000ms
          const delay = Math.pow(2, attempt - 1) * 500;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    // Fallback gracioso com MockProvider caso o provedor principal continue falhando
    console.error(
      `[AIService] Todas as ${maxRetries} tentativas falharam para "${operationName}". Acionando Mock fallback seguro.`
    );
    try {
      const fallbackProvider = new MockAIProvider();
      return await fallbackProvider.generateStructured(prompt, schema);
    } catch (fallbackErr: any) {
      throw new Error(
        `[AIService] Falha crítica em ${operationName}: ${lastError?.message || fallbackErr.message}`
      );
    }
  }

  /**
   * Diagnostica a causa provável de um erro em questão do ENEM
   */
  async diagnoseError(params: {
    questionStatement: string;
    discipline: string;
    subject: string;
    studentAnswer: string;
    correctAnswer: string;
    alternatives: { letter: string; text: string }[];
  }): Promise<ErrorDiagnosisResponse> {
    const prompt = `Analise detalhadamente o erro do estudante nesta questão do ENEM:
Disciplina: ${params.discipline}
Assunto: ${params.subject}
Enunciado: ${params.questionStatement}

Alternativas:
${params.alternatives.map((a) => `${a.letter}) ${a.text}`).join("\n")}

Resposta escolhida pelo aluno: ${params.studentAnswer}
Gabarito oficial correto: ${params.correctAnswer}

Classifique o tipo de erro (FALTA_CONHECIMENTO, ERRO_CONCEITUAL, INTERPRETACAO, CALCULO, ATENCAO, CONFUSAO_ALTERNATIVAS, ESTRATEGIA, TEMPO).
Indique o motivo provável, a lacuna conceitual e exatamente o que o aluno deve estudar.`;

    return this.executeWithRetry("diagnoseError", prompt, ErrorDiagnosisResponseSchema);
  }

  /**
   * Gera flashcards inteligentes baseados em lacunas reais identificadas
   */
  async generateAdaptiveFlashcards(params: {
    subject: string;
    subsubject?: string;
    conceptualGap: string;
    errorCount: number;
  }): Promise<GeneratedFlashcardsResponse> {
    const prompt = `Gere flashcards adaptativos de altíssima qualidade para sanar a seguinte lacuna no ENEM:
Assunto: ${params.subject}
Subassunto: ${params.subsubject || "Geral"}
Lacuna Identificada: ${params.conceptualGap}
Quantidade de erros recentes: ${params.errorCount}

Crie entre 2 e 4 flashcards específicos (tipos: CONCEITO, FORMULA, ARMADILHAS_ENEM, APLICACAO, COMPARACAO).
Não crie cartões genéricos ou óbvios. Foque em como o ENEM recente (2023+) cobra esse conceito.`;

    return this.executeWithRetry(
      "generateAdaptiveFlashcards",
      prompt,
      GeneratedFlashcardsSchema
    );
  }
}

export const aiService = new AIService();
