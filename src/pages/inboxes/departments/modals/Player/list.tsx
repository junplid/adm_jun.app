import { Avatar } from "@components/ui/avatar";
import { FC, useContext, useMemo, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { PlayerContext } from "./context";
import moment from "moment";

const themes: {
  [x: string]: { indicator: string; txt: string; container: string };
} = {
  Aguardando: {
    indicator: "#72462258",
    txt: "#f3dbc5",
    container: "#774c2916",
  },
  Atendendo: { indicator: "#2249695e", txt: "#d1e8fa", container: "#305b7e14" },
  Resolvidos: {
    indicator: "#296e2961",
    txt: "#d1f3d1",
    container: "#2e692e14",
  },
};

export const ListPlayer: FC = () => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { filter, list } = useContext(PlayerContext);

  return (
    <div
      className="flex flex-col relative h-full w-full gap-y-1 rounded-md overflow-hidden"
      style={{ backgroundColor: themes[filter].container }}
    >
      <span
        style={{
          backgroundColor: themes[filter].indicator,
          color: themes[filter].txt,
        }}
        className="text-center font-semibold shadow-md select-none py-3"
      >
        {filter}
      </span>
      {list.length === 0 && (
        <div className="absolute top-20 flex items-center justify-center w-full">
          <span className="text-white/60">Seus tickets aparecerão aqui.</span>
        </div>
      )}
      <Virtuoso
        ref={virtuosoRef}
        data={list}
        className="scroll-custom-table"
        followOutput="smooth"
        itemContent={(_, item) => {
          return <Item {...item} />;
        }}
      />
    </div>
  );
};

interface PropsItem {
  id: number;
  name: string;
  status: "NEW" | "OPEN" | "RESOLVED" | "DELETED";
  userId?: number;
  forceOpen?: boolean;
  notifyMsc?: boolean;
  departmentId: number;
  notifyToast?: boolean;
  lastInteractionDate: Date;
}

const diasDaSemana: { [x: number]: string } = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

function Item(p: PropsItem) {
  const { setCurrentTicket } = useContext(PlayerContext);

  const previewDateLastMsg = useMemo(() => {
    const days = moment().diff(p.lastInteractionDate, "day");
    console.log(days);
    if (days === 0) {
      return moment(p.lastInteractionDate).format("HH:mm");
    }
    if (days === 1) return "Ontem";
    if (days >= 2 || days <= 7) {
      return diasDaSemana[moment(p.lastInteractionDate).day()];
    } else {
      return moment(p.lastInteractionDate).format("DD/MM/YYYY");
    }
  }, [p.lastInteractionDate]);

  return (
    <div
      className={`p-2 py-2.5 hover:bg-[#80808018] duration-100 select-none cursor-pointer mr-1.5`}
      onClick={() => setCurrentTicket(p.id)}
    >
      <div className="flex items-center gap-x-2">
        <Avatar size={"sm"} width={"40px"} bg={"#555555"} height={"40px"} />
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
            <span className="font-medium">{p.name}</span>
            <span className="text-xs text-white/60">{previewDateLastMsg}</span>
          </div>
          <span className="text-[13px] text-white/60 line-clamp-1 pr-7">
            Meu pedido saiu para entrega?
          </span>
        </div>
      </div>
    </div>
  );
}
