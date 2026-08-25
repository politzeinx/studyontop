import fs from "fs";
import path from "path";
import { UserProfile, QuotaType } from "@/context/auth-context";

export interface StoredUser extends UserProfile {
  password?: string;
}

// Caminho do arquivo de banco de dados JSON no servidor
const DB_FILE = path.join(process.cwd(), "src", "lib", "data", "users-store.json");

function readAllUsersFromDisk(): StoredUser[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      if (data.trim()) {
        return JSON.parse(data);
      }
    }
  } catch (e) {
    console.error("[server-storage] Erro ao ler users-store.json:", e);
  }
  return [];
}

function writeAllUsersToDisk(users: StoredUser[]) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("[server-storage] Erro ao gravar users-store.json:", e);
  }
}

export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.toLowerCase().trim();
  const allUsers = readAllUsersFromDisk();
  const found = allUsers.find((u) => u.email.toLowerCase().trim() === normalized);
  return found || null;
}

export function saveUser(user: StoredUser): StoredUser {
  const normalized = user.email.toLowerCase().trim();
  const allUsers = readAllUsersFromDisk();
  const existingIdx = allUsers.findIndex((u) => u.email.toLowerCase().trim() === normalized);

  const existing = existingIdx >= 0 ? allUsers[existingIdx] : null;

  const mergedUser: StoredUser = {
    ...existing,
    ...user,
    email: normalized,
    password: user.password || existing?.password || "",
  };

  if (existingIdx >= 0) {
    allUsers[existingIdx] = mergedUser;
  } else {
    allUsers.push(mergedUser);
  }

  writeAllUsersToDisk(allUsers);
  return mergedUser;
}
