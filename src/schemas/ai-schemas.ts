import { z } from "zod";

/**
 * Esquema de resposta estruturada para Diagnóstico de Erro
 */
export const ErrorDiagnosisResponseSchema = z.object({
  errorTaxonomy: z.enum([
    "FALTA_CONHECIMENTO",
    "ERRO_CONCEITUAL",
    "INTERPRETACAO",
    "CALCULO",
    "ATENCAO",
    "CONFUSAO_ALTERNATIVAS",
    "ESTRATEGIA",
    "TEMPO",
  ]),
  probableCause: z
    .string()
    .min(10, "A causa provável deve ser detalhada.")
    .describe("Explicação pedagógica clara da causa provável do erro."),
  whatToStudy: z
    .string()
    .min(10, "A recomendação de estudo deve ser clara.")
    .describe("Conteúdo específico da matriz do ENEM que o aluno deve revisar."),
  distractorTrap: z
    .string()
    .optional()
    .describe("Qual pegadinha ou distrator levou à escolha da alternativa errada."),
  conceptualGap: z
    .string()
    .describe("A lacuna teórica ou de raciocínio fundamental a ser sanada."),
});

export type ErrorDiagnosisResponse = z.infer<typeof ErrorDiagnosisResponseSchema>;

/**
 * Esquema para Geração de Flashcard Inteligente
 */
export const FlashcardItemSchema = z.object({
  subject: z.string(),
  subsubject: z.string().optional(),
  cardType: z.enum([
    "CONCEITO",
    "IDENTIFICACAO",
    "COMPARACAO",
    "FORMULA",
    "APLICACAO",
    "VERDADEIRO_FALSO",
    "ARMADILHAS_ENEM",
    "ESTRATEGIA",
  ]),
  frontContent: z
    .string()
    .min(5, "O conteúdo frontal deve ser formulado como uma pergunta direta ou gatilho de memória."),
  backContent: z
    .string()
    .min(5, "O verso deve conter a resposta precisa, sucinta e explicativa."),
  keyTakeaway: z.string().optional(),
});

export const GeneratedFlashcardsSchema = z.object({
  cards: z
    .array(FlashcardItemSchema)
    .min(1)
    .max(8)
    .describe("Conjunto focado de flashcards de alta qualidade, sem repetições."),
  synthesisNote: z.string().describe("Resumo das lacunas cobertas pelo baralho."),
});

export type GeneratedFlashcardsResponse = z.infer<typeof GeneratedFlashcardsSchema>;

/**
 * Esquema para Extração de Questão via OCR/Visão
 */
export const ExtractedQuestionSchema = z.object({
  questionNumber: z.number().int().positive(),
  statement: z.string(),
  contextText: z.string().optional().nullable(),
  alternatives: z.array(
    z.object({
      letter: z.enum(["A", "B", "C", "D", "E"]),
      text: z.string(),
    })
  ),
  detectedAnswer: z.enum(["A", "B", "C", "D", "E"]).optional().nullable(),
  confidence: z.number().min(0).max(1),
  hasGraphOrFigure: z.boolean().default(false),
  estimatedSubject: z.string().optional(),
});

export const ExamExtractionResultSchema = z.object({
  questions: z.array(ExtractedQuestionSchema),
  pageCount: z.number().int().default(1),
  overallConfidence: z.number().min(0).max(1),
});

export type ExamExtractionResult = z.infer<typeof ExamExtractionResultSchema>;
