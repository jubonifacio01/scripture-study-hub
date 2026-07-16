export type AchievementCategory =
  "sequencia" | "volume" | "precisao" | "combo" | "progresso" | "nivel" | "social";

export interface AchievementReward {
  type: "companion";
  companionId: string;
}

export interface AchievementInput {
  streak: number;
  totalXP: number;
  level: number;
  totalCorrect: number;
  hasPerfectSession: boolean;
  perfectSessionStreak: number;
  distinctJourneys: number;
  bestCombo: number;
  matchesPlayed: number;
  matchesWon: number;
  roomsHosted: number;
  hasMasteredObjective: boolean;
  studiedAtNight: boolean;
  studiedBothWeekendDays: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  /** Hidden from the list (shown as "???") until unlocked */
  secret?: boolean;
  reward?: AchievementReward;
  isUnlocked: (input: AchievementInput) => boolean;
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  sequencia: "Sequência",
  volume: "Volume de estudo",
  precisao: "Precisão",
  combo: "Combo",
  progresso: "Progresso",
  nivel: "Nível",
  social: "Multiplayer",
};

export const ACHIEVEMENTS: Achievement[] = [
  // Sequência
  {
    id: "seq_3",
    title: "Primeiros Passos",
    description: "Estude 3 dias seguidos.",
    category: "sequencia",
    isUnlocked: (i) => i.streak >= 3,
  },
  {
    id: "seq_7",
    title: "Pastor Fiel",
    description: "Estude 7 dias seguidos.",
    category: "sequencia",
    reward: { type: "companion", companionId: "sheep" },
    isUnlocked: (i) => i.streak >= 7,
  },
  {
    id: "seq_30",
    title: "Perseverança",
    description: "Estude 30 dias seguidos.",
    category: "sequencia",
    isUnlocked: (i) => i.streak >= 30,
  },
  {
    id: "seq_100",
    title: "Um Século de Fé",
    description: "Estude 100 dias seguidos.",
    category: "sequencia",
    isUnlocked: (i) => i.streak >= 100,
  },

  // Volume
  {
    id: "vol_50",
    title: "Aprendiz",
    description: "Acerte 50 respostas.",
    category: "volume",
    isUnlocked: (i) => i.totalCorrect >= 50,
  },
  {
    id: "vol_200",
    title: "Guardião das Palavras",
    description: "Acerte 200 respostas.",
    category: "volume",
    reward: { type: "companion", companionId: "owl" },
    isUnlocked: (i) => i.totalCorrect >= 200,
  },
  {
    id: "vol_500",
    title: "Biblioteca Viva",
    description: "Acerte 500 respostas.",
    category: "volume",
    isUnlocked: (i) => i.totalCorrect >= 500,
  },

  // Precisão
  {
    id: "prec_perfect",
    title: "Sessão Perfeita",
    description: "Complete uma sessão com 100% de acerto (mínimo de 5 perguntas).",
    category: "precisao",
    isUnlocked: (i) => i.hasPerfectSession,
  },
  {
    id: "prec_streak3",
    title: "Trinca de Ouro",
    description: "Complete 3 sessões perfeitas seguidas.",
    category: "precisao",
    isUnlocked: (i) => i.perfectSessionStreak >= 3,
  },

  // Combo
  {
    id: "combo_10",
    title: "Sequência em Chamas",
    description: "Alcance um combo de 10 respostas certas seguidas.",
    category: "combo",
    isUnlocked: (i) => i.bestCombo >= 10,
  },
  {
    id: "combo_20",
    title: "Imparável",
    description: "Alcance um combo de 20 respostas certas seguidas.",
    category: "combo",
    isUnlocked: (i) => i.bestCombo >= 20,
  },

  // Progresso
  {
    id: "prog_objective",
    title: "Objetivo Cumprido",
    description: "Complete uma sessão de um objetivo com pelo menos 90% de acerto.",
    category: "progresso",
    isUnlocked: (i) => i.hasMasteredObjective,
  },
  {
    id: "prog_journeys3",
    title: "Andarilho da Fé",
    description: "Estude em 3 jornadas diferentes.",
    category: "progresso",
    reward: { type: "companion", companionId: "donkey" },
    isUnlocked: (i) => i.distinctJourneys >= 3,
  },
  {
    id: "prog_journeys6",
    title: "Explorador Completo",
    description: "Estude em 6 jornadas diferentes.",
    category: "progresso",
    isUnlocked: (i) => i.distinctJourneys >= 6,
  },

  // Nível
  {
    id: "lvl_5",
    title: "Subindo de Nível",
    description: "Alcance o nível 5.",
    category: "nivel",
    isUnlocked: (i) => i.level >= 5,
  },
  {
    id: "lvl_10",
    title: "Mãos que Criam",
    description: "Alcance o nível 10.",
    category: "nivel",
    reward: { type: "companion", companionId: "vase" },
    isUnlocked: (i) => i.level >= 10,
  },
  {
    id: "lvl_20",
    title: "Mestre em Formação",
    description: "Alcance o nível 20.",
    category: "nivel",
    isUnlocked: (i) => i.level >= 20,
  },

  // Social / multiplayer
  {
    id: "soc_first_match",
    title: "Primeira Partida",
    description: "Jogue sua primeira partida multiplayer.",
    category: "social",
    isUnlocked: (i) => i.matchesPlayed >= 1,
  },
  {
    id: "soc_wins5",
    title: "Pescador de Almas",
    description: "Vença 5 partidas multiplayer.",
    category: "social",
    reward: { type: "companion", companionId: "fish" },
    isUnlocked: (i) => i.matchesWon >= 5,
  },
  {
    id: "soc_host",
    title: "Anfitrião",
    description: "Crie sua primeira sala multiplayer.",
    category: "social",
    secret: true,
    isUnlocked: (i) => i.roomsHosted >= 1,
  },

  // Secretas
  {
    id: "sec_night",
    title: "Coruja da Madrugada",
    description: "Estude entre meia-noite e 5h da manhã.",
    category: "precisao",
    secret: true,
    isUnlocked: (i) => i.studiedAtNight,
  },
  {
    id: "sec_weekend",
    title: "Fim de Semana Dedicado",
    description: "Estude no sábado e no domingo da mesma semana.",
    category: "sequencia",
    secret: true,
    isUnlocked: (i) => i.studiedBothWeekendDays,
  },
];
