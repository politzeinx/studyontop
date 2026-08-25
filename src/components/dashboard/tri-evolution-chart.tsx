"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const data = [
  { exam: "Sim. 1", date: "02/07", score: 685.0, consistency: 82 },
  { exam: "Sim. 2", date: "16/07", score: 702.4, consistency: 84 },
  { exam: "Sim. 3", date: "30/07", score: 718.2, consistency: 80 },
  { exam: "Sim. 4", date: "07/08", score: 724.8, consistency: 86 },
  { exam: "Sim. 5", date: "14/08", score: 738.0, consistency: 89 },
  { exam: "Sim. 6", date: "21/08", score: 748.5, consistency: 88 },
];

export function TriEvolutionChart() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTri" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="exam"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
          />
          <YAxis
            domain={[600, 850]}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-xs space-y-1">
                    <span className="font-bold text-white block">{item.exam} ({item.date})</span>
                    <span className="text-indigo-400 font-extrabold block text-sm">
                      {item.score.toFixed(1)} TRI Estimada
                    </span>
                    <span className="text-slate-400 block text-[10px]">
                      Consistência: <strong className="text-emerald-400">{item.consistency}%</strong>
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Target Cutoff Score */}
          <ReferenceLine
            y={810}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{
              value: "Nota de Corte: 810",
              fill: "#f43f5e",
              fontSize: 10,
              position: "top",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTri)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
