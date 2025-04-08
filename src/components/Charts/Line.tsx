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

type Atividades =
  | "Acordar as 6hr da manhã"
  | "Estudar 2hr"
  | "Trabalhar 7hr Botstudio"
  | "Exercitar"
  | "Ler durante 2hr"
  | "Trabalhar 2-4hr no projeto pessoal"
  | "Dormir durante 7hr"
  | "Dormir as 21hr da noite"
  | "Tomar café da manha"
  | "Comer a tarde"
  | "Hitratar-se ao dia"
  | "Escovar os dentes de manha"
  | "Escovar os dentes a tarde"
  | "Escovar os dentes a noite"
  | "Almoçar meio dia";

const atividades: { [x in Atividades]: [number, number] } = {
  "Almoçar meio dia": [1, -1],
  "Acordar as 6hr da manhã": [1, -1],
  "Comer a tarde": [1, -1],
  "Dormir as 21hr da noite": [1, -1],
  "Dormir durante 7hr": [1, -1],
  "Estudar 2hr": [1, -1],
  Exercitar: [1, -1],
  "Hitratar-se ao dia": [1, -1],
  "Ler durante 2hr": [1, -1],
  "Tomar café da manha": [1, -1],
  "Trabalhar 2-4hr no projeto pessoal": [1, -1],
  "Trabalhar 7hr Botstudio": [1, -1],
  "Escovar os dentes de manha": [1, -1],
  "Escovar os dentes a tarde": [1, -1],
  "Escovar os dentes a noite": [1, -1],
};

const calculeteAtividades = (list: Atividades[], type: 1 | 2): number => {
  return list.reduce((acc, atividade) => {
    const value = atividades[atividade];
    return acc + value[type - 1];
  }, 0);
};

export default function FourLineCharts(): JSX.Element {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  const data1 = {
    labels: [
      "08/04",
      "09/04",
      "10/04",
      "11/04",
      "12/04",
      "13/04",
      "14/04",
      "15/04",
      "16/04",
      "17/04",
      "18/04",
      "19/04",
      "20/04",
      "21/04",
      "22/04",
      "23/04",
      "24/04",
      "25/04",
      "26/04",
      "27/04",
      "28/04",
      "29/04",
    ],
    datasets: [
      {
        label: "Procrastinação",
        data: [
          calculeteAtividades(
            [
              "Acordar as 6hr da manhã",
              "Comer a tarde",
              "Dormir as 21hr da noite",
              "Estudar 2hr",
              "Exercitar",
              "Hitratar-se ao dia",
              "Ler durante 2hr",
              "Tomar café da manha",
              "Trabalhar 7hr Botstudio",
              "Dormir durante 7hr",
              "Escovar os dentes de manha",
              "Escovar os dentes a tarde",
            ],
            2
          ),
        ],
        borderColor: "#c93333",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Disciplina",
        data: [
          calculeteAtividades(
            ["Trabalhar 2-4hr no projeto pessoal", "Almoçar meio dia"],
            1
          ),
        ],
        borderColor: "#5dc04b",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="grid gap-y-50 flex-1">
      <div className="w-full h-96">
        <Line data={data1} options={options} />
      </div>
    </div>
  );
}
