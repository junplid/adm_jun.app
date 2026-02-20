import { FC, JSX, useContext, useEffect, useState } from "react";
import { LayoutSettingsPageContext } from "../contexts";
import { SectionCancelPlan } from "./sections/cancel-plan";
import { SectionUserSupport } from "./sections/user-support";

import React from "react";
import { getSubscription } from "../../../services/api/Account";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { Skeleton } from "@chakra-ui/react";

type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid";

interface PlanCardProps {
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string; // ISO date
  cardBrand?: string;
  cardLast4?: string;
}
const statusMap: Record<SubscriptionStatus, { label: string; color: string }> =
  {
    active: {
      label: "Ativo",
      color: "bg-green-100/20 text-green-300 font-semibold",
    },
    trialing: { label: "Em teste", color: "bg-blue-100/20 text-blue-300" },
    past_due: {
      label: "Pagamento pendente",
      color: "bg-yellow-100/20 text-yellow-400",
    },
    canceled: { label: "Cancelado", color: "bg-gray-100/20 text-gray-300" },
    incomplete: {
      label: "Pagamento não concluído",
      color: "bg-red-100/20 text-red-300",
    },
    incomplete_expired: {
      label: "Pagamento expirado",
      color: "bg-red-200/20 text-red-400",
    },
    paused: {
      label: "Assinatura pausada",
      color: "bg-purple-100/20 text-purple-300",
    },
    unpaid: {
      label: "Pagamento não realizado",
      color: "bg-red-300/20 text-red-400",
    },
  };

const CurrentPlanCard: FC<PlanCardProps> = ({
  planName,
  status,
  currentPeriodEnd,
  cardBrand,
  cardLast4,
}) => {
  const formattedDate = new Date(currentPeriodEnd).toLocaleDateString("pt-BR");
  const statusInfo = statusMap[status];

  return (
    <div className="flex text-white flex-wrap items-end border bg-[#1a1c1c] rounded-2xl p-3 border-neutral-800 justify-between gap-x-2">
      <div className="flex flex-wrap max-w-xl items-center justify-between w-full gap-x-1.5">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-md ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>

        <div className="">
          <p className="text-sm font-light text-gray-300">Plano contratado</p>
          <p className="text-sm font-semibold">{planName}</p>
        </div>

        <div className="">
          <p className="text-sm font-light text-gray-300">
            {status === "canceled" ? "Acesso até" : "Próxima cobrança"}
          </p>
          <p className="text-sm font-semibold">{formattedDate}</p>
        </div>

        {cardBrand && cardLast4 && (
          <div className="">
            <p className="text-sm font-light text-gray-300">Cartão vinculado</p>
            <p className="text-sm font-semibold">
              {cardBrand.toUpperCase()} •••• {cardLast4}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const SettingsSubscriptionPage: React.FC = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const { ToggleMenu } = useContext(LayoutSettingsPageContext);
  const [plan, setPlan] = useState<PlanCardProps | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sub = await getSubscription();
        setPlan(sub);
        setLoad(true);
      } catch (error) {
        setLoad(true);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
        }
      }
    })();
  }, []);

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:flex">{ToggleMenu}</span>
            <h1 className="text-base sm:text-lg font-semibold">Meu plano</h1>
          </div>
        </div>
      </div>
      <div className="pl-0.5 flex flex-col pr-2 gap-y-6 overflow-y-auto h-[calc(100vh-140px)] pb-20 sm:h-[calc(100vh-175px)] md:h-[calc(100vh-150px)]">
        {!load && <Skeleton className="rounded-2xl!" height={"65px"} />}
        {plan && load && <CurrentPlanCard {...plan} />}
        <SectionUserSupport />
        <div className="bg-white/10 w-full h-px"></div>
        <SectionCancelPlan />
      </div>
    </div>
  );
};
