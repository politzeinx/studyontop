"use client";

import { Settings, User, Bell, Shield, Smartphone, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          Configurações da Conta & Preferências
        </h1>
        <p className="text-sm text-slate-400">
          Personalize seu objetivo ENEM, horas de estudo diárias e preferências do motor adaptativo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Perfil & Meta ENEM
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Nome do Aluno</label>
              <input
                type="text"
                defaultValue="Luis Teles"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Curso Desejado</label>
              <input
                type="text"
                defaultValue="Medicina"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Universidade Alvo</label>
              <input
                type="text"
                defaultValue="USP (Universidade de São Paulo)"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>
          <Button variant="primary" size="sm">Salvar Alterações</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Parâmetros do Plano de Estudo
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Horas Disponíveis por Dia</label>
              <input
                type="number"
                defaultValue={3.0}
                step={0.5}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Dias de Estudo por Semana</label>
              <input
                type="number"
                defaultValue={6}
                max={7}
                min={1}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm">Atualizar Cronograma</Button>
        </Card>
      </div>
    </div>
  );
}
