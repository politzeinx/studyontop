import fs from "fs";
import path from "path";
import os from "os";
import { UserProfile, QuotaType } from "@/context/auth-context";

export interface StoredUser extends UserProfile {
  password?: string;
}

// 1. Arquivo local para desenvolvimento
const DEV_DB_FILE = path.join(process.cwd(), "src", "lib", "data", "users-store.json");

// 2. Arquivo temporário seguro para ambientes Serverless (Vercel)
const SERVERLESS_DB_FILE = path.join(os.tmpdir(), "studyontop_users.json");

// 3. Namespace em nuvem para sincronização global entre múltiplos dispositivos na Vercel
const CLOUD_SYNC_BUCKET = "studyontop_v1_sync";
const CLOUD_STORAGE_ENDPOINT = `https://kvdb.io/Kyx7m7PjE7kZ2DqG2u99Lw`;

// Cache em memória compartilhado durante o ciclo da requisição
let memoryUsers: StoredUser[] = [];

// Lê usuários de arquivo local
function readUsersFromLocal(): StoredUser[] {
  // Tenta ler do diretório do projeto
  try {
    if (fs.existsSync(DEV_DB_FILE)) {
      const data = fs.readFileSync(DEV_DB_FILE, "utf-8");
      if (data.trim()) return JSON.parse(data);
    }
  } catch (e) {}

  // Tenta ler do /tmp (Vercel)
  try {
    if (fs.existsSync(SERVERLESS_DB_FILE)) {
      const data = fs.readFileSync(SERVERLESS_DB_FILE, "utf-8");
      if (data.trim()) return JSON.parse(data);
    }
  } catch (e) {}

  return [];
}

// Grava usuários no arquivo local ou /tmp
function writeUsersToLocal(users: StoredUser[]) {
  // Grava no DEV_DB_FILE se não estiver no Vercel (read-only)
  try {
    const dir = path.dirname(DEV_DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DEV_DB_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {}

  // Sempre grava no /tmp
  try {
    fs.writeFileSync(SERVERLESS_DB_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {}
}

/**
 * Busca o usuário no Cloud Storage Global ou no armazenamento local
 */
export async function findUserByEmailAsync(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  const key = `user_${normalized.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // 1. Tenta buscar no Cloud KV (compartilhado entre Vercel, PC e Celular)
  try {
    const res = await fetch(`${CLOUD_STORAGE_ENDPOINT}/${key}?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const user = await res.json();
      if (user && user.email) {
        return user;
      }
    }
  } catch (e) {}

  // 2. Fallback para arquivo em disco local
  const localUsers = readUsersFromLocal();
  const localFound = localUsers.find((u) => u.email.toLowerCase().trim() === normalized);
  if (localFound) {
    // Sincroniza de volta para a nuvem em background
    saveUserAsync(localFound).catch(() => {});
    return localFound;
  }

  return null;
}

/**
 * Salva o usuário no Cloud Storage Global e no armazenamento local
 */
export async function saveUserAsync(user: StoredUser): Promise<StoredUser> {
  const normalized = user.email.toLowerCase().trim();
  const key = `user_${normalized.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // 1. Grava no Cloud KV compartilhado
  try {
    await fetch(`${CLOUD_STORAGE_ENDPOINT}/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  } catch (e) {}

  // 2. Grava no disco local / /tmp
  const localUsers = readUsersFromLocal();
  const existingIdx = localUsers.findIndex((u) => u.email.toLowerCase().trim() === normalized);

  if (existingIdx >= 0) {
    localUsers[existingIdx] = user;
  } else {
    localUsers.push(user);
  }
  writeUsersToLocal(localUsers);

  return user;
}

// Wrappers síncronos para compatibilidade
export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.toLowerCase().trim();
  const localUsers = readUsersFromLocal();
  return localUsers.find((u) => u.email.toLowerCase().trim() === normalized) || null;
}

export function saveUser(user: StoredUser): StoredUser {
  saveUserAsync(user).catch(() => {});
  const normalized = user.email.toLowerCase().trim();
  const localUsers = readUsersFromLocal();
  const existingIdx = localUsers.findIndex((u) => u.email.toLowerCase().trim() === normalized);
  if (existingIdx >= 0) localUsers[existingIdx] = user;
  else localUsers.push(user);
  writeUsersToLocal(localUsers);
  return user;
}
