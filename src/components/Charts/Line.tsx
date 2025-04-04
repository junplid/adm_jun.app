import { JSX } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FourLineCharts(): JSX.Element {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  const data1 = {
    labels: [
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
      "2024",
      "2025",
      "2026",
      "2027",
      "2028",
      "2029",
    ],
    datasets: [
      {
        label: "CLT",
        data: [
          954, 998, 1045, 1101, 1212, 1321, 1412, 1518, 1618, 1718, 1818, 1918,
          2018,
        ],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Empresário",
        data: [
          1500, 10, 4500, 5, 4000, 2251, 6000, 8814, 10214, 12214, 16014, 36514,
        ],
        borderColor: "#5dc04b",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="grid grid-cols-2 gap-y-50 flex-1">
      <div className="w-full h-full">
        <Line data={data1} options={options} />
      </div>
    </div>
  );
}
