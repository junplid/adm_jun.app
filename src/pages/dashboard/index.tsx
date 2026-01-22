// import LineChart from "@components/Charts/Line";
// import RadarCharts from "@components/Charts/Radar";
import { JSX } from "react";

export function DashboardPage(): JSX.Element {
  return (
    <div>
      {/* <div className="pointer-events-none select-none opacity-40 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
        <div className="flex flex-col bg-[#2e2b2b85] overflow-hidden rounded-xl shadow-lg shadow-black/30">
          <div className="flex items-center justify-between p-3 pb-0 gap-2">
            <div className="">
              <h1 className="text-xs text-white/70 font-medium">
                Novos contatos
              </h1>
              <span className="font-medium text-3xl">2.070</span>
            </div>
            <span className="text-[#addb98] font-bold text-xl">+893.11%</span>
          </div>
          <div
            style={{
              height: "125px",
              width: "calc(100% + 10px)",
              transform: "translateX(-5px) translateY(-6px)",
            }}
          >
            <LineChart
              data={{
                labels: [
                  "07/05/2023",
                  "08/05/2023",
                  "09/05/2023",
                  "10/05/2023",
                  "11/05/2023",
                  "12/05/2023",
                  "13/05/2023",
                  "14/05/2023",
                  "15/05/2023",
                  "16/05/2023",
                  "17/05/2023",
                  "18/05/2023",
                ],
                datasets: [
                  {
                    label: "",
                    data: [
                      43, 14, 29, 32, 123, 177, 147, 217, 327, 307, 227, 427,
                    ],
                    borderColor: "rgba(255, 255, 255, 0.514)",
                    fill: true,
                    tension: 0.2,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) return;
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top
                      );
                      gradient.addColorStop(1, "rgba(255, 255, 255, 0.219)");
                      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                      return gradient;
                    },
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                layout: { padding: 0 },
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  y: {
                    display: false,
                    beginAtZero: false,
                    grace: 0,
                    ticks: { display: false },
                    grid: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { display: false, color: "#ccc" },
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-2 bg-[#2e2b2b85] overflow-hidden rounded-xl shadow-lg shadow-black/30">
          <div className="flex items-center justify-between p-3 pb-0 gap-2">
            <h1 className="text-xs text-white/70 font-medium">
              Top 4 Etiquetas
            </h1>
          </div>
          <div>
            <RadarCharts
              data={{
                labels: ["COMPRADOR", "VENDEDOR", "CLIENTE", "FORNECEDOR"],
                datasets: [
                  {
                    data: [59, 40, 18, 20],
                    fill: true,
                    backgroundColor: "rgba(224, 221, 221, 0.438)",
                    pointRadius: 4,
                    borderColor: "rgba(255, 255, 255, 0.514)",
                    tension: 0.4,
                    borderWidth: 2,
                    pointBorderWidth: 1,
                    borderJoinStyle: "round",
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  r: {
                    pointLabels: {
                      color: "#c5c5c5",
                      font: { weight: "bold", size: 9 },
                    },
                    ticks: { display: false },
                    grid: { color: "rgba(255, 255, 255, 0.247)", lineWidth: 1 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div> */}

      <div className="mt-20 flex flex-col text-sm text-center text-white/70">
        <span>Estamos construindo algo melhor.</span>
        <span className="text-white text-base">
          Em breve, métricas profundas e mais inteligentes.
        </span>
      </div>
    </div>
  );
}
