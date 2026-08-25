import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailAsync, saveUserAsync } from "@/lib/server-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Por favor, informe seu e-mail." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: "Por favor, informe sua senha." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const storedUser = await findUserByEmailAsync(email);

    if (!storedUser) {
      return NextResponse.json(
        { error: "Nenhuma conta encontrada com este e-mail. Clique em 'Criar Conta Real' para se cadastrar." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Se o usuário ainda não tinha senha definida, registra a senha digitada agora
    if (!storedUser.password && password.trim()) {
      storedUser.password = password.trim();
      await saveUserAsync(storedUser);
    } else if (storedUser.password && storedUser.password !== password.trim()) {
      return NextResponse.json(
        { error: "Senha incorreta. Verifique a senha digitada e tente novamente." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Retorna os dados exatos sem o campo de senha
    const { password: _, ...userSafe } = storedUser;

    return NextResponse.json(
      { user: userSafe },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro no login" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
