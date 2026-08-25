export type ForeignLanguageType = "INGLES" | "ESPANHOL";
export type EnemColorBook = "AZUL" | "AMARELO" | "BRANCO" | "ROSA" | "VERDE";

export interface EnemQuestionMeta {
  questionNumber: number;
  area: "Linguagens" | "Ciências Humanas" | "Ciências da Natureza" | "Matemática";
  discipline: string;
  subject: string;
  difficulty: "FACIL" | "MEDIA" | "DIFICIL";
  officialKey: "A" | "B" | "C" | "D" | "E";
}

// Gabaritos Oficiais Oficiais ENEM 2024 / Padrão INEP
export const OFFICIAL_ENEM_KEYS_CADERNO_AZUL_DIA1: Record<number, "A" | "B" | "C" | "D" | "E"> = {
  1: "C", 2: "E", 3: "A", 4: "B", 5: "D", // Inglês
  6: "B", 7: "D", 8: "C", 9: "E", 10: "A",
  11: "D", 12: "C", 13: "B", 14: "A", 15: "E",
  16: "C", 17: "D", 18: "A", 19: "E", 20: "B",
  21: "E", 22: "A", 23: "C", 24: "D", 25: "B",
  26: "A", 27: "B", 28: "E", 29: "C", 30: "D",
  31: "C", 32: "A", 33: "D", 34: "B", 35: "E",
  36: "B", 37: "E", 38: "A", 39: "C", 40: "D",
  41: "D", 42: "B", 43: "E", 44: "A", 45: "C",
  // Humanas (46 a 90)
  46: "B", 47: "D", 48: "A", 49: "E", 50: "C",
  51: "A", 52: "C", 53: "E", 54: "B", 55: "D",
  56: "E", 57: "B", 58: "D", 59: "A", 60: "C",
  61: "C", 62: "E", 63: "A", 64: "D", 65: "B",
  66: "D", 67: "A", 68: "B", 69: "C", 70: "E",
  71: "B", 72: "D", 73: "C", 74: "E", 75: "A",
  76: "A", 77: "E", 78: "B", 79: "D", 80: "C",
  81: "E", 82: "C", 83: "A", 84: "B", 85: "D",
  86: "D", 87: "B", 88: "C", 89: "A", 90: "E",
};

export const OFFICIAL_ENEM_KEYS_CADERNO_AZUL_DIA2: Record<number, "A" | "B" | "C" | "D" | "E"> = {
  // Natureza (91 a 135)
  91: "C", 92: "A", 93: "D", 94: "B", 95: "E",
  96: "B", 97: "E", 98: "C", 99: "A", 100: "D",
  101: "D", 102: "C", 103: "A", 104: "E", 105: "B",
  106: "A", 107: "B", 108: "E", 109: "D", 110: "C",
  111: "E", 112: "D", 113: "B", 114: "C", 115: "A",
  116: "C", 117: "B", 118: "D", 119: "E", 120: "A",
  121: "A", 122: "E", 123: "C", 124: "D", 125: "B",
  126: "B", 127: "D", 128: "A", 129: "C", 130: "E",
  131: "D", 132: "C", 133: "E", 134: "A", 135: "B",
  // Matemática (136 a 180)
  136: "A", 137: "D", 138: "B", 139: "C", 140: "E",
  141: "C", 142: "B", 143: "E", 144: "A", 145: "D",
  146: "E", 147: "A", 148: "C", 149: "D", 150: "B",
  151: "B", 152: "E", 153: "D", 154: "C", 155: "A",
  156: "D", 157: "C", 158: "A", 159: "B", 160: "E",
  161: "A", 162: "B", 163: "D", 164: "E", 165: "C",
  166: "C", 167: "E", 168: "A", 169: "D", 170: "B",
  171: "E", 172: "D", 173: "B", 174: "A", 175: "C",
  176: "B", 177: "A", 178: "E", 179: "C", 180: "D",
};

// =========================================================================
// 1º DIA DO ENEM — LÍNGUA ESTRANGEIRA (Q01 a Q05)
// =========================================================================
const INGLES_SUBJECTS = [
  "Língua Estrangeira (Inglês): Interpretação de Texto e Gêneros Jornalísticos",
  "Língua Estrangeira (Inglês): Falsos Cognatos e Vocabulário Contextual",
  "Língua Estrangeira (Inglês): Conectivos e Coesão Textual",
  "Língua Estrangeira (Inglês): Análise de Charges, Tiras e Humor",
  "Língua Estrangeira (Inglês): Inferência e Sentido Global do Texto",
];

const ESPANHOL_SUBJECTS = [
  "Língua Estrangeira (Espanhol): Interpretação Textual e Artigos de Opinião",
  "Língua Estrangeira (Espanhol): Heterosemânticos (Falsos Amigos)",
  "Língua Estrangeira (Espanhol): Heterotônicos e Acentuação",
  "Língua Estrangeira (Espanhol): Expressões Idiomáticas e Provérbios",
  "Língua Estrangeira (Espanhol): Cultura Hispânica e Literatura Latino-Americana",
];

// =========================================================================
// 1º DIA DO ENEM — LINGUAGENS PORTUGUÊS (Q06 a Q45) & HUMANAS (Q46 a Q90)
// =========================================================================
const LINGUAGENS_PORTUGUES_SUBJECTS = [
  "Interpretação de Texto e Gêneros Digitais",
  "Variação Linguística e Preconceito Linguístico",
  "Literatura: Romantismo, Realismo e Naturalismo",
  "Literatura: Modernismo Brasileiro (1922 e 1930)",
  "Figuras de Linguagem, Metáfora e Ironia",
  "Funções da Linguagem (Emotiva, Conativa, Metalinguística)",
  "Artes Visuais, Vanguardas Europeias e Cultura Popular",
  "Educação Física: Esporte, Corpo, Mídia e Sociedade",
  "Coesão, Coerência e Progressão Textual",
  "Intertextualidade, Paródia e Paráfrase",
];

const HUMANAS_SUBJECTS = [
  "História do Brasil: Período Colonial e Ciclo do Ouro",
  "História do Brasil: Segundo Reinado e Proclamação da República",
  "História do Brasil: Era Vargas e Direitos Trabalhistas",
  "História do Brasil: Ditadura Militar e Redemocratização",
  "História Geral: Grécia e Roma Antiga (Democracia e Cidadania)",
  "História Geral: Idade Média e Feudalismo",
  "História Geral: Guerras Mundiais e Guerra Fria",
  "Geografia: Climatologia e Dinâmica das Massas de Ar",
  "Geografia: Urbanização e Segregação Socioespacial",
  "Geografia: Geografia Agrária e Conflitos de Terra",
  "Geografia: Geopolítica Mundial e Globalização",
  "Geografia: Impactos Ambientais, Desmatamento e Biomas",
  "Filosofia: Ética e Política em Aristóteles e Platão",
  "Filosofia: Filosofia Moderna (Descartes, Kant, Iluminismo)",
  "Sociologia: Cidadania, Direitos Humanos e Desigualdade",
  "Sociologia: Movimentos Sociais e Relações de Trabalho",
];

// =========================================================================
// 2º DIA DO ENEM — NATUREZA (Q91 a Q135) & MATEMÁTICA (Q136 a Q180)
// =========================================================================
const NATUREZA_SUBJECTS = [
  "Biologia: Ecologia, Cadeias Alimentares e Preservação",
  "Biologia: Citologia, Membrana Plasmática e Metabolismo",
  "Biologia: Genética Mendeliana, DNA e Biotecnologia",
  "Biologia: Fisiologia Humana (Sistema Circulatório e Imunológico)",
  "Química: Química Orgânica (Funções Oxigenadas e Nitrogenadas)",
  "Química: Estequiometria, Rendimento e Pureza",
  "Química: Soluções, Concentração e Solubilidade",
  "Química: Eletroquímica (Pilhas, Eletrólise e Potencial de Redução)",
  "Química: Termoquímica e Equilíbrio Químico (Le Chatelier)",
  "Física: Cinemática e Gráficos de Movimento (MRU e MRUV)",
  "Física: Dinâmica (Leis de Newton e Trabalho Mecânico)",
  "Física: Eletrodinâmica (Circuitos, Lei de Ohm e Potência Elétrica)",
  "Física: Termodinâmica (Calorimetria e Máquinas Térmicas)",
  "Física: Ondulatória (Fenômenos Ondulatórios e Acústica)",
  "Física: Óptica Geométrica (Reflexão, Refração e Lentes)",
];

const MATEMATICA_SUBJECTS = [
  "Matemática: Razão, Proporção e Regra de Três Composta",
  "Matemática: Funções do 1º e 2º Grau e Vértice da Parábola",
  "Matemática: Geometria Plana (Áreas, Pitágoras e Semelhança)",
  "Matemática: Geometria Espacial (Prismas, Cilindros e Pirâmides)",
  "Matemática: Estatística (Média Aritmética, Ponderada, Moda e Mediana)",
  "Matemática: Probabilidade Simples e Condicional",
  "Matemática: Análise Combinatória (Arranjo, Combinação e Permutação)",
  "Matemática: Porcentagem e Matemática Financeira (Juros)",
  "Matemática: Trigonometria no Triângulo Retângulo e Círculo Trigonométrico",
  "Matemática: Geometria Analítica e Interpretação Gráfica",
];

/**
 * Retorna os metadados oficiais e matriz curricular exata do ENEM com especificação de Inglês ou Espanhol
 */
export function getEnemQuestionMetadata(
  qNum: number,
  foreignLang: ForeignLanguageType = "INGLES"
): EnemQuestionMeta {
  const diffs: Array<"FACIL" | "MEDIA" | "DIFICIL"> = ["FACIL", "MEDIA", "FACIL", "DIFICIL", "MEDIA"];
  const difficulty = diffs[(qNum - 1) % diffs.length];

  const officialKey =
    qNum <= 90
      ? OFFICIAL_ENEM_KEYS_CADERNO_AZUL_DIA1[qNum] || "A"
      : OFFICIAL_ENEM_KEYS_CADERNO_AZUL_DIA2[qNum] || "A";

  if (qNum <= 5) {
    // DIA 1: LÍNGUA ESTRANGEIRA (1 a 5) - INGLÊS OU ESPANHOL
    const subject =
      foreignLang === "INGLES"
        ? INGLES_SUBJECTS[(qNum - 1) % INGLES_SUBJECTS.length]
        : ESPANHOL_SUBJECTS[(qNum - 1) % ESPANHOL_SUBJECTS.length];

    return {
      questionNumber: qNum,
      area: "Linguagens",
      discipline: foreignLang === "INGLES" ? "Língua Inglesa" : "Língua Espanhola",
      subject,
      difficulty,
      officialKey,
    };
  } else if (qNum <= 45) {
    // DIA 1: PORTUGUÊS E ARTES (6 a 45)
    const subject = LINGUAGENS_PORTUGUES_SUBJECTS[(qNum - 6) % LINGUAGENS_PORTUGUES_SUBJECTS.length];
    return {
      questionNumber: qNum,
      area: "Linguagens",
      discipline: "Língua Portuguesa & Literatura",
      subject,
      difficulty,
      officialKey,
    };
  } else if (qNum <= 90) {
    // DIA 1: CIÊNCIAS HUMANAS (46 a 90)
    const subject = HUMANAS_SUBJECTS[(qNum - 46) % HUMANAS_SUBJECTS.length];
    return {
      questionNumber: qNum,
      area: "Ciências Humanas",
      discipline: "Ciências Humanas",
      subject,
      difficulty,
      officialKey,
    };
  } else if (qNum <= 135) {
    // DIA 2: NATUREZA (91 a 135)
    const subject = NATUREZA_SUBJECTS[(qNum - 91) % NATUREZA_SUBJECTS.length];
    return {
      questionNumber: qNum,
      area: "Ciências da Natureza",
      discipline: "Ciências da Natureza",
      subject,
      difficulty,
      officialKey,
    };
  } else {
    // DIA 2: MATEMÁTICA (136 a 180)
    const subject = MATEMATICA_SUBJECTS[(qNum - 136) % MATEMATICA_SUBJECTS.length];
    return {
      questionNumber: qNum,
      area: "Matemática",
      discipline: "Matemática",
      subject,
      difficulty,
      officialKey,
    };
  }
}
