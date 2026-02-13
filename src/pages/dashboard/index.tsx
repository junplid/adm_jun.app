import { JSX, useContext, useEffect, useState } from "react";
import { InstallPWA } from "./InstallPWA";
import LineCharts from "@components/Charts/Line";
import { SocketContext } from "@contexts/socket.context";
import { useRoomWebSocket } from "../../hooks/roomWebSocket";
import { getServicesToday } from "../../services/api/Dashboard";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { AuthContext } from "@contexts/auth.context";
import { Skeleton } from "@chakra-ui/react";
import { useFiveMinuteClock } from "../../hooks/preciseFiveMinuteListener";

export function DashboardPage(): JSX.Element {
  const { logout } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [servicesToday, setServicesToday] = useState<
    Record<string, number | null>
  >({});
  const [currentValue, setCurrentValue] = useState<number>(0);

  const { socket } = useContext(SocketContext);
  useRoomWebSocket("dashboard", undefined);

  useFiveMinuteClock((hour) => {
    console.log(hour);
    setServicesToday((services) => {
      if (services[hour] === null) {
        const keys = Object.keys(services);
        const index = keys.findIndex((s) => s === hour);
        if (index < 0) {
          return { ...services };
        } else {
          const prevIndex = Math.max(0, index - 1);
          const valuePrev = services[keys[prevIndex]];
          services[hour] = valuePrev || 0;
          setCurrentValue(valuePrev || 0);
        }
      } else {
        services[hour] = services[hour] || 0;
        setCurrentValue(services[hour] || 0);
      }
      return { ...services };
    });
  });

  useEffect(() => {
    (async () => {
      try {
        const services = await getServicesToday();
        const lastIndex = Object.values(services).findIndex((s) => s === null);
        if (lastIndex >= 0) {
          setCurrentValue(Object.values(services)[lastIndex - 1] || 0);
        }

        setServicesToday(services);
        setTimeout(() => setLoad(false), 200);
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
        throw error;
      }
      socket.on(
        "dashboard_services",
        (data: { delta: number; hour: string }) => {
          setServicesToday((services) => {
            if (services[data.hour] === null) {
              const keys = Object.keys(services);
              const index = keys.findIndex((s) => s === data.hour);
              if (index < 0) {
                return { ...services };
              } else {
                const prevIndex = Math.max(0, index - 1);
                const valuePrev = services[keys[prevIndex]];
                const nextValue = (valuePrev || 0) + data.delta;
                services[data.hour] = nextValue;
                setCurrentValue(nextValue);
              }
            } else {
              const nextValue = (services[data.hour] || 0) + data.delta;
              services[data.hour] = nextValue;
              setCurrentValue(nextValue);
            }
            return { ...services };
          });
        },
      );
    })();

    return () => {
      socket.off("dashboard_services");
    };
  }, []);

  return (
    <div className="sm:p-0 p-2">
      <Skeleton
        height="200px"
        className="rounded-xl!"
        loading={load}
        css={{
          "--start-color": "#474545",
          "--end-color": "#36333385",
        }}
      >
        <div className="flex flex-col justify-between bg-[#2e2b2b85]! overflow-hidden rounded-xl shadow-md">
          <div className="flex w-full items-start justify-between gap-x-1 pt-3 px-3 pb-3">
            <div className="flex items-center justify-between pb-0 gap-2">
              <div className="flex items-center gap-x-2">
                <h1 className="text-sm text-white/90 font-medium">
                  Atendimentos simultâneos
                </h1>
                <span
                  style={{
                    opacity: currentValue ? 1 : 0.4,
                  }}
                  className="bg-white/60 font-medium px-3 rounded-xl text-xs text-black block"
                >
                  {currentValue}
                </span>
              </div>
              {/* <div className="flex items-center">
              <span className="font-semibold text-xl">13</span>
              <span className="text-[#84df5a] text-sm">+90%</span>
            </div> */}
            </div>
            {/* <div className="flex items-center gap-1 text-gray-100">
            <BsCalendarWeek />
            <button className="flex bg-gray-100 border p-0.5 px-2 rounded-sm">
              <span className="text-[11px] text-black/70">20/01 - 27/01</span>
            </button>
          </div> */}
          </div>

          <div
            style={{
              width: "calc(100%)",
              height: 160,
            }}
            className="p-0.5 pt-0"
          >
            <LineCharts
              data={{
                labels: Object.keys(servicesToday),
                datasets: [
                  {
                    label: "",
                    data: Object.values(servicesToday),
                    borderColor: "rgba(255, 255, 255, 0.514)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) return;
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top,
                      );
                      gradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");
                      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                      return gradient;
                    },
                    pointRadius: (ctx) => {
                      const index = ctx.dataIndex;
                      const lastIndex = ctx.dataset.data.findIndex(
                        (s) => s === null,
                      );
                      if (lastIndex < 0) {
                        return index === 23 ? 3 : 0;
                      } else {
                        return index === lastIndex - 1 ? 3 : 0;
                      }
                    },
                  },
                ],
              }}
              options={{
                layout: { padding: 0 },
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {},
                },
                scales: {
                  y: {
                    display: true,
                    beginAtZero: false,
                    grace: 0,
                    suggestedMax: 8,
                    ticks: { display: true, font: { size: 8 } },
                    grid: { display: true, color: "rgba(255, 255, 255, 0.04)" },
                  },
                  x: {
                    grid: { display: true, color: "rgba(255, 255, 255, 0.04)" },
                    ticks: {
                      display: true,
                      font: { size: 7 },
                      maxRotation: 0,
                      callback(tickValue) {
                        const label = this.getLabelForValue(
                          tickValue as number,
                        );
                        if (label.endsWith(":00")) {
                          return label.replace(":00", "h");
                        }

                        return label;
                      },
                    },
                    display: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </Skeleton>

      <div className="mt-10 flex flex-col text-sm text-center text-white/70">
        <span>Estamos construindo algo melhor.</span>
        <span className="text-white text-base">
          Em breve, métricas profundas e mais inteligentes.
        </span>
      </div>
      <InstallPWA />
    </div>
  );
}
