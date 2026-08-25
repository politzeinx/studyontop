import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, saveUser } from "@/lib/server-storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Por favor, informe seu e-mail." }, { status: 400 });
    }

    if (!password || !password.trim()) {
      return NextResponse.json({ error: "Por favor, informe sua senha." }, { status: 400 });
    }

    const storedUser = findUserByEmail(email);

    if (!storedUser) {
      return NextResponse.json(
        { error: "Nenhuma conta encontrada com este e-mail. Clique em 'Criar Conta Real' para se cadastrar." },
        { status: 401 }
      );
    }

    // Se o usuário ainda não tinha senha definida (conta pré-existente), registra a senha digitada agora
    if (!storedUser.password && password.trim()) {
      storedUser.password = password.trim();
      saveUser(storedUser);
    } else if (storedUser.password && storedUser.password !== password.trim()) {
      return NextResponse.json(
        { error: "Senha incorreta. Verifique a senha digitada e tente novamente." },
        { status: 401 }
      );
    }

    // Retorna os dados exatos sem o campo de senha
    const { password: _, ...userSafe } = storedUser;

    return NextResponse.json({ user: userSafe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no login" }, { status: 500 });
  }
}
