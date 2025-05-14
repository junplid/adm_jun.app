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
  RadialLinearScale,
  RadarController,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  PointElement,
  RadialLinearScale,
  RadarController,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface ILineChartProps {
  options?: ChartOptions<"radar">;
  data: ChartData<"radar", any, string>;
}
export default function RadarCharts(props: ILineChartProps): JSX.Element {
  return (
    <Radar
      data={props.data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        ...props.options,
      }}
    />
  );
}
