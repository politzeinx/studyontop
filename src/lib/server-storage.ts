import fs from "fs";
import path from "path";
import { UserProfile, QuotaType } from "@/context/auth-context";

export interface StoredUser extends UserProfile {
  password?: string;
}

// Caminho do arquivo de banco de dados JSON no servidor
const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "users-store.json");

// Memória em runtime para cache
const memoryStore = new Map<string, StoredUser>();

function loadStoreFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      if (data.trim()) {
        const list: StoredUser[] = JSON.parse(data);
        list.forEach((u) => memoryStore.set(u.email.toLowerCase().trim(), u));
      }
    }
  } catch (e) {
    // Fallback silencioso
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
    // Em Vercel/Serverless o FS é read-only, memoryStore atua durante o ciclo
  }
}

// Carrega os dados na inicialização
loadStoreFromFile();

export function findUserByEmail(email: string): StoredUser | null {
  loadStoreFromFile();
  const normalized = email.toLowerCase().trim();
  return memoryStore.get(normalized) || null;
}

export function saveUser(user: StoredUser): StoredUser {
  const normalized = user.email.toLowerCase().trim();
  const existing = memoryStore.get(normalized);
  
  // Preserva a senha se não for passada uma nova
  const updatedUser: StoredUser = {
    ...existing,
    ...user,
    email: normalized,
    password: user.password || existing?.password || "",
  };

  memoryStore.set(normalized, updatedUser);
  saveStoreToFile();
  return updatedUser;
}
