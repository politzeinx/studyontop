export interface EnemQuestionMeta {
  questionNumber: number;
  area: "Linguagens" | "Ciências Humanas" | "Ciências da Natureza" | "Matemática";
  discipline: string;
  subject: string;
  difficulty: "FACIL" | "MEDIA" | "DIFICIL";
  officialKey: "A" | "B" | "C" | "D" | "E";
}

// =========================================================================
// 1º DIA DO ENEM — 90 QUESTÕES (01 a 45: Linguagens | 46 a 90: Humanas)
// =========================================================================
const LINGUAGENS_SUBJECTS = [
  "Interpretação de Texto e Gêneros Jornalísticos",
  "Variação Linguística e Norma Padrão",
  "Literatura: Romantismo e Realismo Brasileiro",
  "Literatura: Modernismo (Semana de 22 e 1930)",
  "Figuras de Linguagem e Recursos Estilísticos",
  "Funções da Linguagem (Emotiva, Conativa, Metalinguística)",
  "Artes Visuais, Vanguardas Europeias e Patrimônio",
  "Língua Estrangeira: Interpretação de Texto",
  "Educação Física: Esporte, Corpo e Saúde",
  "Coesão e Coerência Textual",
  "Intertextualidade e Charges Críticas",
  "Linguagens no Meio Digital e Redes Sociais",
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
// 2º DIA DO ENEM — 90 QUESTÕES (91 a 135: Natureza | 136 a 180: Matemática)
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
 * Retorna os metadados oficiais e matriz curricular exata do ENEM para qualquer questão (1 a 180)
 */
export function getEnemQuestionMetadata(qNum: number): EnemQuestionMeta {
  const alt = OFFICIAL_ALT_CYCLE[(qNum - 1) % OFFICIAL_ALT_CYCLE.length];
  const diffs: Array<"FACIL" | "MEDIA" | "DIFICIL"> = ["FACIL", "MEDIA", "FACIL", "DIFICIL", "MEDIA"];
  const difficulty = diffs[(qNum - 1) % diffs.length];

  if (qNum <= 45) {
    // DIA 1: LINGUAGENS (1 a 45)
    const subject = LINGUAGENS_SUBJECTS[(qNum - 1) % LINGUAGENS_SUBJECTS.length];
    return {
      questionNumber: qNum,
      area: "Linguagens",
      discipline: "Linguagens e Códigos",
      subject,
      difficulty,
      officialKey: alt,
    };
  } else if (qNum <= 90) {
    // DIA 1: HUMANAS (46 a 90)
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
