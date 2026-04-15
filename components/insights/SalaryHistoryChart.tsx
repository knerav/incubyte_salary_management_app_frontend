"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { HistoricalSalaryInsights } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  history: HistoricalSalaryInsights;
}

export default function SalaryHistoryChart({ history }: Props) {
  if (history.series.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No data available</p>
    );
  }

  const data = {
    labels: history.series.map((p) => p.period),
    datasets: [
      {
        label: "Avg Salary",
        data: history.series.map((p) => parseFloat(p.avg_salary)),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return (
    <Line
      data={data}
      options={options}
      aria-label="Salary history chart"
      role="img"
    />
  );
}
