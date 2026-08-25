import fs from "fs";
import path from "path";
import { UserProfile, estimateSisuCutoffScore, QuotaType } from "@/context/auth-context";

// Caminho do arquivo de banco de dados JSON no servidor local
const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "users-store.json");

// Memória em runtime para persistência rápida
const memoryStore = new Map<string, UserProfile>();

// Inicializa usuários padrão
const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    id: "user-luis",
    name: "Luis Teles",
    email: "luisfilocreao@gmail.com",
    targetCourse: "Engenharia de Software",
    targetCollege: "Federal",
    quotaType: "AMPLA",
    targetScore: 765,
    studyHoursPerDay: 3,
    studyDaysPerWeek: 7,
    isDemo: false,
    streakDays: 1,
    currentTriScore: 500.0,
  },
];

DEFAULT_ACCOUNTS.forEach((u) => memoryStore.set(u.email.toLowerCase(), u));

function loadStoreFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const list: UserProfile[] = JSON.parse(data);
      list.forEach((u) => memoryStore.set(u.email.toLowerCase(), u));
    }
  } catch (e) {
    // Fallback silencioso para memoryStore em ambientes serverless
  }
}

function saveStoreToFile() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const list = Array.from(memoryStore.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    // Em Vercel/Serverless o FS é read-only, memoryStore atua durante o ciclo da função
  }
}

// Carrega na inicialização
loadStoreFromFile();

export function findUserByEmail(email: string): UserProfile | null {
  loadStoreFromFile();
  const normalized = email.toLowerCase().trim();
  return memoryStore.get(normalized) || null;
}

export function saveUser(user: UserProfile): UserProfile {
  const normalized = user.email.toLowerCase().trim();
  memoryStore.set(normalized, user);
  saveStoreToFile();
  return user;
}
