import { Circle, Portal, Spinner } from "@chakra-ui/react";
import { FloatChannelComponent } from "@components/FloatChannel";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { JSX } from "@emotion/react/jsx-runtime";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDialogModal } from "../../hooks/dialog.modal";
import {
  getOrders,
  runActionOrder,
  TypePriorityOrder,
  TypeStatusOrder,
} from "../../services/api/Orders";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import fontColorContrast from "font-color-contrast";
import moment from "moment";
import autoAnimate from "@formkit/auto-animate";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { SocketContext } from "@contexts/socket.context";
import { LuBriefcaseBusiness, LuMapPin } from "react-icons/lu";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import { formatToBRL } from "brazilian-values";
import clsx from "clsx";
import {
  MdSignalWifiConnectedNoInternet0,
  MdSupportAgent,
} from "react-icons/md";
import { ImConnection } from "react-icons/im";
import { BiTimeFive } from "react-icons/bi";
import { ModalChatPlayer } from "../inboxes/departments/modals/Player/modalChat";
import { useRoomWebSocket } from "../../hooks/roomWebSocket";

export type ItemID = string;

export interface KanbanData {
  todo: ItemID[];
  doing: ItemID[];
  done: ItemID[];
}

interface Order {
  id: number;
  name: string | null;
  n_order: string;
  businessId: number;
  description: string | null;
  origin: string | null;
  createAt: Date;
  delivery_address: string | null;
  payment_method: string | null;
  actionChannels: string[];

  channel: "baileys" | "instagram";
  contact?: string;

  status: TypeStatusOrder;
  priority: TypePriorityOrder | null;
  data: string | null;
  total: string | null;
  sequence: number;
  isDragDisabled: boolean;
  ticket: {
    connection: { s: boolean; name: string; channel: "baileys" | "instagram" };
    id: number;
    // lastMessage: "bot" | "contact" | "user" | "system";
    departmentName: string;
    status: "NEW" | "OPEN";
  }[];
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

function TicketCard({
  tk,
  id,
  ...props
}: {
  tk: Order["ticket"][0];
  onOpenDialog: (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => void;
  onCloseDialog: () => void;
  businessId: number;
  n_order: string;
  name: string | null;
  id: number;
}) {
  return (
    <div
      key={tk.id}
      style={{
        background:
          tk.status === "OPEN"
            ? "linear-gradient(143deg,rgba(88, 172, 245, 0.04) 0%, rgba(52, 126, 191, 0.12) 100%)"
            : "linear-gradient(143deg,rgba(235, 203, 175, 0.07) 0%, rgba(219, 155, 99, 0.09) 100%)",
      }}
      className="relative cursor-pointer p-2 pr-2.5 rounded-md flex items-center justify-between w-full gap-x-1.5"
      onClick={() =>
        props.onOpenDialog({
          size: "xl",
          content: (
            <ModalChatPlayer
              orderId={id}
              close={props.onCloseDialog}
              data={{
                businessId: props.businessId,
                id: tk.id,
                name: `#${props.n_order} / ${props.name}`,
              }}
            />
          ),
        })
      }
    >
      <div className="flex flex-col -space-y-0.5">
        <div className="flex gap-x-1 items-center">
          <LuBriefcaseBusiness size={12} />
          <span className="font-medium text-xs line-clamp-1">
            {tk.departmentName}
          </span>
        </div>
        <div className="flex gap-x-1 text-xs items-center">
          {tk.connection.s ? (
            <ImConnection color={"#7bf1a8e2"} size={12} />
          ) : (
            <MdSignalWifiConnectedNoInternet0 color={"#f17b7b"} size={12} />
          )}
          <span
            className={tk.connection.s ? "text-[#7bf1a892]" : "text-[#f18686]"}
          >
            {tk.connection.name}
          </span>
        </div>
      </div>
      <div className="flex relative">
        {/* {tk.lastMessage === "contact" && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 rounded-full h-1.5 bg-[#22b512]" />
                      )} */}
        {tk.status === "OPEN" ? (
          <MdSupportAgent size={20} color="#58ACF5" />
        ) : (
          <BiTimeFive size={20} color="#EDA058" />
        )}
      </div>
    </div>
  );
}

export function SortableItem({
  isOverlay,
  order,
  onCloseDialog,
  onOpenDialog,
}: {
  order: Order;
  isOverlay?: boolean;
  onOpenDialog: (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => void;
  onCloseDialog: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
  });

  const [actionsLoad, setActionsLoad] = useState<string[]>([]);
  const parent = useRef(null);
  const { logout } = useContext(AuthContext);
  const previewDateLastMsg = useMemo(() => {
    const days = moment().diff(order.createAt, "day");
    if (days === 0) {
      return moment(order.createAt).format("HH:mm");
    }
    if (days === 1) return "Ontem";
    if (days >= 2 || days <= 7) {
      return diasDaSemana[moment(order.createAt).day()];
    } else {
      return moment(order.createAt).format("DD/MM/YYYY");
    }
  }, [order.createAt]);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const run = useCallback(
    async (action: string) => {
      if (actionsLoad.includes(action)) return;
      try {
        setActionsLoad([...actionsLoad, action]);
        await runActionOrder(order.id, action);
        setActionsLoad(actionsLoad.filter((s) => s !== action));
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
        throw error;
      }
    },
    [actionsLoad],
  );

  const composedTransition = [transition, "outline 400ms"]
    .filter(Boolean)
    .join(", ");

  return (
    <div ref={setNodeRef} className="p-1">
      <div
        className={clsx("select-none relative")}
        style={{
          transform: CSS.Translate.toString(transform),
          transition: composedTransition,
          backgroundColor: isOverlay ? "#2E2E2E" : "#1e1e1e",
          // marginBottom: "6px",
          cursor: isOverlay ? "grabbing" : "grab",
          zIndex: !isDragging ? 1 : "auto",
          boxShadow: isOverlay
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
            : "none",
          outline: isDragging ? "2px dashed #fff" : "2px dashed transparent",
          outlineOffset: "-2px",
        }}
        {...attributes}
        {...listeners}
      >
        <div
          className={clsx(
            "relative gap-1 pb-2",
            !isOverlay && isDragging ? "opacity-0" : "opacity-100",
            // isOver && "opacity-0",
          )}
        >
          {!isDragging && (
            <FloatChannelComponent channel={"instagram"} offset={[2, 4]} />
          )}
          <div className="px-2 pt-2 flex w-full mb-0 items-center gap-x-1 justify-between">
            <span className="text-white/55 text-xs sm:text-sm ml-3">
              #{order.n_order}
            </span>

            <span className="text-white/35 text-xs sm:text-sm">
              {previewDateLastMsg}
            </span>
          </div>
          {(order.name || order.description) && (
            <div className="px-2 flex flex-col -space-y-1 w-full">
              <span className="line-clamp-2 text-xs sm:text-sm font-medium w-full">
                {order.name}
              </span>
              <span className="line-clamp-3 text-white/60 text-xs sm:text-sm w-full">
                {order.description}
              </span>
            </div>
          )}
          {order.data ? (
            <div className="relative gap-y-1 duration-200 bg-zinc-700/15 w-full">
              <div className="border-b-2 mb-1.5 w-full border-dashed border-zinc-600/40" />
              <p className="leading-5 text-xs sm:text-sm p-1 px-2">
                {parse(format(order.data))}
              </p>
              <div className="border-b-2 mt-1.5 w-full border-dashed border-zinc-600/40" />
            </div>
          ) : (
            <div className="border-b-2 my-2 w-full border-dashed border-zinc-600/40" />
          )}
          {order.delivery_address && (
            <div className="px-2 flex items-start mt-1 gap-x-0.5 text-white/60">
              <LuMapPin />
              <span className="line-clamp-3 text-xs w-full">
                {order.delivery_address}
              </span>
            </div>
          )}
          {order.total && (
            <div className="px-2 flex font-bold text-xs sm:text-sm items-center justify-end w-full gap-x-1">
              <span>{formatToBRL(order.total)}</span>
            </div>
          )}

          <div ref={parent} className="flex px-1 flex-col w-full mt-2 gap-y-1">
            {order.ticket.map((tk) => (
              <TicketCard
                businessId={order.businessId}
                id={order.id}
                n_order={order.n_order}
                name={order.name}
                tk={tk}
                key={tk.id}
                onCloseDialog={onCloseDialog}
                onOpenDialog={onOpenDialog}
              />
            ))}
          </div>

          {!!order.actionChannels?.length && (
            <div className="flex flex-col items-center w-full">
              {/* <span className="text-xs text-center font-semibold text-white/70">
                        - Ações do pedido -
                      </span> */}
              <div className="w-full grid grid-cols-2 gap-x-1 px-1">
                {order.actionChannels.map((a, index) => (
                  <button
                    key={index}
                    className="w-full font-medium py-1 px-1 text-xs bg-slate-400/20 mb-2 cursor-pointer rounded-sm shadow"
                    onClick={() => !actionsLoad.includes(a) && run(a)}
                    disabled={actionsLoad.includes(a)}
                  >
                    {actionsLoad.includes(a) ? <Spinner size={"xs"} /> : a}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ContainerProps {
  isHighlighted: boolean | null;
  column: { id: string; name: string; color: string };
  rows: Order[];
  loadMoveTicket: number | null;
  onOpenDialog: (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => void;
  onCloseDialog(): void;
}

export function Container(props: ContainerProps) {
  const { setNodeRef } = useDroppable({ id: props.column.id });

  return (
    <div
      ref={setNodeRef}
      style={{ width: "203px" }}
      className="grid grid-rows-[40px_1fr] sm:grid-rows-[50px_1fr] select-none sm:w-52 sm:min-w-52 min-w-44 w-44"
    >
      <div className="">
        <div
          style={{
            background: props.column.color,
          }}
          className="gap-1.5 p-2 sticky top-0 z-50 sm:p-3 rounded-sm flex items-center sm:rounded-md justify-between"
        >
          <span
            className="text-sm sm:text-base"
            style={{ color: fontColorContrast(props.column.color + "72") }}
          >
            {props.column.name}
          </span>
          <Circle p={"1px"} px={"13px"} fontSize={"14px"} bg={"#6d6d6d2c"}>
            {props.rows?.length || 0}
          </Circle>
        </div>
      </div>

      <div
        className={clsx("pb-10 flex-1 py-2 scroll-custom overflow-y-scroll")}
      >
        <SortableContext
          id={props.column.id}
          items={props.rows}
          strategy={verticalListSortingStrategy}
        >
          {props.rows?.map((row) => (
            <SortableItem
              order={row}
              onCloseDialog={props.onCloseDialog}
              onOpenDialog={props.onOpenDialog}
              key={row.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function calcRank(prev?: { sequence: number }, next?: { sequence: number }) {
  const GAP = 640;
  let newRank: number;

  if (!prev && !next) {
    newRank = GAP;
  } else if (!prev && next) {
    newRank = next.sequence - GAP;
  } else if (!next && prev) {
    newRank = prev.sequence + GAP;
  } else {
    newRank = (prev!.sequence + next!.sequence) / 2;
  }

  return newRank;
}

const columns: {
  label: string;
  value: TypeStatusOrder;
  color: string;
}[] = [
  { label: "Aguardando", value: "confirmed", color: "#0EA5E933" },
  { label: "Em preparo", value: "processing", color: "#F9731633" },
  { label: "Embalagem", value: "ready", color: "#22C55E33" },
  { label: "A caminho", value: "on_way", color: "#3B82F633" },
  { label: "Finalizados", value: "completed", color: "#14B8A633" },
];

export const OrdersPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { logout } = useContext(AuthContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});
  const [orders, setOrders] = useState<{ [x: string]: Order[] }>(
    {} as { [x: string]: Order[] },
  );
  const [load, setLoad] = useState(true);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  // const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
  );

  const findContainer = (id: string | number) => {
    if (id in orders) return id as string;
    return Object.keys(orders).find((key) =>
      orders[key].find((item) => item.id === id),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const container = findContainer(active.id);
    if (container) {
      const order = orders[container].find((o) => o.id === active.id);
      setActiveOrder(order || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (activeContainer && overContainer) {
      if (activeContainer !== overContainer) {
        setOrders((prev) => {
          const activeItems = prev[activeContainer];
          const overItems = prev[overContainer];

          const activeIndex = activeItems.findIndex(
            (item) => item.id === active.id,
          );

          let overIndex = 0;
          if (typeof overId === "string") {
            overIndex = overItems.length;
          } else {
            overIndex = overItems.findIndex((item) => item.id === overId);
            if (overIndex < 0) {
              overIndex = overItems.length;
            }
          }

          const itemRemoved = activeItems.splice(activeIndex, 1);
          overItems.splice(overIndex, 0, itemRemoved[0]);

          return {
            ...prev,
            [activeContainer]: activeItems.filter(
              (item) => item.id !== active.id,
            ),
            [overContainer]: overItems,
          };
        });
      } else {
        setOrders((prev) => {
          const column = prev[overContainer];
          const activeIndex = column.findIndex((item) => item.id === active.id);

          let overIndex = 0;

          if (typeof overId === "string") {
            return prev;
          } else {
            overIndex = column.findIndex((item) => item.id === overId);
            console.log(activeIndex, overIndex);
          }

          return {
            ...prev,
            [activeContainer]: arrayMove(column, activeIndex, overIndex),
          };
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (activeContainer && overContainer) {
      if (activeContainer !== overContainer) {
        setOrders((prev) => {
          const activeItems = prev[activeContainer];
          const overItems = prev[overContainer];

          const activeIndex = activeItems.findIndex(
            (item) => item.id === active.id,
          );

          let overIndex = 0;
          if (typeof overId === "string") {
            overIndex = overItems.length;
          } else {
            overIndex = overItems.findIndex((item) => item.id === overId);
            if (overIndex < 0) {
              overIndex = overItems.length;
            }
          }

          const [itemRemoved] = activeItems.splice(activeIndex, 1);
          overItems.splice(overIndex, 0, itemRemoved);

          const prevRank = overItems[overIndex - 1]
            ? { sequence: overItems[overIndex - 1].sequence }
            : undefined;
          const nextRank = overItems[overIndex + 1]
            ? { sequence: overItems[overIndex + 1].sequence }
            : undefined;
          const newRank = calcRank(prevRank, nextRank);

          const nextOrdersDest = overItems.map((c) => {
            if (c.id === itemRemoved.id) c.sequence = newRank;
            return c;
          });

          socket.emit("update_status", {
            rank: newRank,
            orderId: active.id,
            nextIndex: overIndex,
            sourceStatus: activeContainer,
            nextStatus: overContainer,
          });

          return {
            ...prev,
            [activeContainer]: activeItems.filter(
              (item) => item.id !== active.id,
            ),
            [overContainer]: nextOrdersDest,
          };
        });
      } else {
        setOrders((prev) => {
          const column = prev[overContainer];
          const activeIndex = column.findIndex((item) => item.id === active.id);

          let overIndex = 0;

          if (typeof overId === "string") {
            return prev;
          } else {
            overIndex = column.findIndex((item) => item.id === overId);
          }

          const prevRank = column[overIndex - 1]
            ? { sequence: column[overIndex - 1].sequence }
            : undefined;
          const nextRank = column[overIndex + 1]
            ? { sequence: column[overIndex + 1].sequence }
            : undefined;
          const newRank = calcRank(prevRank, nextRank);

          socket.emit("update_rank", {
            rank: newRank,
            orderId: active.id,
            nextIndex: overIndex,
            status: overContainer,
          });

          const nextOrdersDest = column.map((c) => {
            if (c.id === active.id) c.sequence = newRank;
            return c;
          });

          return {
            ...prev,
            [activeContainer]: arrayMove(
              nextOrdersDest,
              activeIndex,
              overIndex,
            ),
          };
        });
      }
    }
    setActiveOrder(null);
  };

  const dropAnimation: DropAnimation = {
    easing: "ease-in-out",
    duration: 250,
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0" } },
    }),
  };

  async function get() {
    try {
      const { orders: oL } = await getOrders({
        status: [
          "pending",
          "confirmed",
          "processing",
          "ready",
          "on_way",
          "completed",
        ],
      });
      setOrders(oL);
      // await new Promise((p) => setTimeout(p, 2100));
      setLoad(false);
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
  }

  useEffect(() => {
    get();
  }, []);

  useRoomWebSocket("orders", undefined);

  useEffect(() => {
    socket.on("new_order", (order: Order) => {
      setOrders((state) => {
        const stateClone = structuredClone(state);
        stateClone[order.status].push(order);
        return stateClone;
      });
    });

    socket.on("update_order", (order: Order) => {
      setOrders((state) => {
        const stateClone = structuredClone(state);
        const nextListStatus = stateClone[order.status].map((o) => {
          if (o.id === order.id) o = { ...o, ...order };
          return o;
        });
        stateClone[order.status] = nextListStatus;
        return stateClone;
      });
    });

    socket.on(
      "remove_ticket",
      async (props: {
        orderId: number;
        ticketId: number;
        status: TypeStatusOrder;
      }) => {
        await new Promise((s) => setTimeout(s, 400));
        setOrders((state) => {
          const stateClone = structuredClone(state);
          stateClone[props.status].map((order) => {
            if (order.id === props.orderId) {
              const nextTk = order.ticket.filter(
                (s) => s.id !== props.ticketId,
              );
              order.ticket = nextTk;
            }
            return order;
          });
          return stateClone;
        });
      },
    );

    socket.on(
      "return_ticket",
      async (props: {
        orderId: number;
        ticketId: number;
        status: TypeStatusOrder;
      }) => {
        await new Promise((s) => setTimeout(s, 400));
        setOrders((state) => {
          const stateClone = structuredClone(state);
          stateClone[props.status].map((order) => {
            if (order.id === props.orderId) {
              order.ticket = order.ticket.map((tk) => {
                if (tk.id === props.ticketId) tk.status = "NEW";
                return tk;
              });
            }
            return order;
          });
          return stateClone;
        });
      },
    );

    socket.on(
      "open_ticket",
      async (props: {
        orderId: number;
        ticketId: number;
        status: TypeStatusOrder;
      }) => {
        await new Promise((s) => setTimeout(s, 400));
        setOrders((state) => {
          const stateClone = structuredClone(state);
          stateClone[props.status].map((order) => {
            if (order.id === props.orderId) {
              order.ticket = order.ticket.map((tk) => {
                if (tk.id === props.ticketId) tk.status = "OPEN";
                return tk;
              });
            }
            return order;
          });
          return stateClone;
        });
      },
    );

    socket.on(
      "new_ticket",
      async (props: {
        status: TypeStatusOrder;
        orderId: number;
        ticket: {
          connection: {
            name: string;
            channel: "baileys" | "instagram";
            s: boolean;
          };
          id: number;
          lastMessage: "bot" | "contact" | "user" | "system";
          departmentName: string;
          status: "NEW" | "OPEN";
        };
      }) => {
        await new Promise((s) => setTimeout(s, 400));
        setOrders((state) => {
          const stateClone = structuredClone(state);
          stateClone[props.status].map((order) => {
            if (order.id === props.orderId) {
              order.ticket.push(props.ticket);
            }
            return order;
          });
          return stateClone;
        });
      },
    );

    socket.on(
      "update_rank",
      (props: {
        rank: number;
        orderId: number;
        nextIndex: number;
        status: TypeStatusOrder;
      }) => {
        setOrders((state) => {
          const copyState = structuredClone(state);
          const reordered = copyState[props.status];
          const indexOrder = reordered.findIndex((o) => o.id === props.orderId);
          if (indexOrder < 0) {
            console.log("essa ordem não foi encontrada nessa tabela!");
            return copyState;
          }
          const [itemDeleted] = reordered.splice(indexOrder, 1);
          reordered.splice(props.nextIndex, 0, {
            ...itemDeleted,
            sequence: props.rank,
          });
          copyState[props.status] = reordered;
          return copyState;
        });
        // setLoadOrders(stt => [...stt, props.orderId]);
        // setTimeout(() => {
        // setLoadOrders(stt => stt.filter(s => s !== props.orderId));
        // }, 400);
      },
    );

    socket.on(
      "update_status",
      (props: {
        rank: number;
        orderId: number;
        nextIndex: number;
        sourceStatus: TypeStatusOrder;
        nextStatus: TypeStatusOrder;
      }) => {
        setOrders((state) => {
          const copyState = structuredClone(state);
          const ordersStart = copyState[props.sourceStatus];
          const indexOrder = ordersStart.findIndex(
            (o) => o.id === props.orderId,
          );
          if (indexOrder < 0) {
            console.log("essa ordem não foi encontrada nessa tabela!");
            return copyState;
          }

          const [itemDeleted] = ordersStart.splice(indexOrder, 1);
          const ordersDest = copyState[props.nextStatus];
          ordersDest.splice(props.nextIndex, 0, {
            ...itemDeleted,
            sequence: props.rank,
          });

          copyState[props.sourceStatus] = ordersStart;
          copyState[props.nextStatus] = ordersDest;
          return copyState;
        });
        // setLoadOrders(stt => [...stt, props.orderId]);
        // setTimeout(() => {
        // setLoadOrders(stt => stt.filter(s => s !== props.orderId));
        // }, 400);
      },
    );

    return () => {
      socket.off("new_order");
      socket.off("update_status");
      socket.off("update_rank");
      socket.off("new_ticket");
      socket.off("remove_ticket");
      socket.off("return_ticket");
      socket.off("open_ticket");
    };
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col sm:pl-0 pl-2">
        <div className="flex items-center gap-x-2 sm:gap-x-5">
          <h1 className="text-base sm:text-lg font-semibold">Pedidos</h1>
        </div>
        <p className="text-white/60 font-light sm:text-base text-sm">
          Centralize seus pedidos em um único lugar.
        </p>
      </div>
      <div className="flex-1 pt-0! grid gap-x-2 h-full">
        {load ? (
          <div className="bg-white/5 sm:m-0 m-2 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <div className="md:h-[calc(100svh-154px)] sm:h-[calc(100svh-165px)] h-[calc(100svh-130px)] flex gap-x-2 overflow-x-auto">
            <DndContext
              sensors={sensors}
              // collisionDetection={closestCorners}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {columns?.map((column) => {
                return (
                  <Container
                    isHighlighted={false}
                    onCloseDialog={close}
                    onOpenDialog={onOpen}
                    loadMoveTicket={null}
                    key={column.value}
                    column={{
                      id: column.value,
                      name: column.label,
                      color: column.color,
                    }}
                    rows={orders[column.value]}
                  />
                );
              })}
              <Portal>
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeOrder ? (
                    <SortableItem
                      order={activeOrder}
                      onCloseDialog={close}
                      onOpenDialog={onOpen}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </Portal>
            </DndContext>
          </div>
        )}
      </div>
      {DialogModal}
    </div>
  );
};
