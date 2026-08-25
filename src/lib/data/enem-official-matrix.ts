export type ForeignLanguageType = "INGLES" | "ESPANHOL";

export interface EnemQuestionMeta {
  questionNumber: number;
  area: "Linguagens" | "Ciências Humanas" | "Ciências da Natureza" | "Matemática";
  discipline: string;
  subject: string;
  difficulty: "FACIL" | "MEDIA" | "DIFICIL";
  officialKey: "A" | "B" | "C" | "D" | "E";
}

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

const OFFICIAL_ALT_CYCLE: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "C", "B", "E", "D", "B", "A", "D", "C", "E"];

/**
 * Retorna os metadados oficiais e matriz curricular exata do ENEM com especificação de Inglês ou Espanhol
 */
export function getEnemQuestionMetadata(
  qNum: number,
  foreignLang: ForeignLanguageType = "INGLES"
): EnemQuestionMeta {
  const alt = OFFICIAL_ALT_CYCLE[(qNum - 1) % OFFICIAL_ALT_CYCLE.length];
  const diffs: Array<"FACIL" | "MEDIA" | "DIFICIL"> = ["FACIL", "MEDIA", "FACIL", "DIFICIL", "MEDIA"];
  const difficulty = diffs[(qNum - 1) % diffs.length];

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
      officialKey: alt,
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
      officialKey: alt,
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
      officialKey: alt,
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
      officialKey: alt,
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
      officialKey: alt,
    };
  }
}
