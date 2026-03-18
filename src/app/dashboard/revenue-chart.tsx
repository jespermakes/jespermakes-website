"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DailyRevenue = {
  date: string;
  beacons: number;
  store: number;
};

export default function RevenueChart({ data }: { data: DailyRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="date"
          tick={{ fill: "#888", fontSize: 12 }}
          axisLine={{ stroke: "#333" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#888", fontSize: 12 }}
          axisLine={{ stroke: "#333" }}
          tickLine={false}
          tickFormatter={(v) => `€${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
          }}
          formatter={(value, name) => [
            `€${Number(value).toFixed(2)}`,
            name === "beacons" ? "Beacons" : "Jesper Makes Store",
          ]}
          labelStyle={{ color: "#aaa" }}
        />
        <Legend
          formatter={(value) =>
            value === "beacons" ? "Beacons" : "Jesper Makes Store"
          }
          wrapperStyle={{ color: "#aaa" }}
        />
        <Bar dataKey="beacons" stackId="a" fill="#C17F3C" radius={[0, 0, 0, 0]} />
        <Bar dataKey="store" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
