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
  ChartOptions,
  Filler,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface ILineChartProps {
  options?: ChartOptions<"line">;
  data: ChartData<"line", any, string>;
}
export default function LineCharts(props: ILineChartProps): JSX.Element {
  return (
    <Line
      data={props.data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        ...props.options,
        // plugins: {
        //   legend: {
        //     display: false, // ❌ remove legenda
        //   },
        //   title: {
        //     display: false, // ❌ remove título
        //   },
        // },
        // scales: {
        //   y: {
        //     display: false, // ❌ remove eixo Y (numeração e linha)
        //   },
        //   x: {
        //     grid: {
        //       display: false, // opcional: remover grade do eixo X
        //     },
        //     ticks: {
        //       color: "#ccc", // opcional: se quiser deixar bem discreto
        //     },
        //   },
        // },
      }}
    />
  );
}
