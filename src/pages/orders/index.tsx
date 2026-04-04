import { Circle, Collapsible, Portal, Spinner } from "@chakra-ui/react";
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
  TouchSensor,
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
import { LuBriefcaseBusiness } from "react-icons/lu";
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
import { BsFillLockFill } from "react-icons/bs";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";
import { TbMapShare, TbPlayerTrackNext } from "react-icons/tb";
import opacity from "hex-color-opacity";

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
  payment_change_to: string | null;
  actionChannels: string[];
  delivery_cep: string | null;
  delivery_complement: string | null;
  delivery_reference_point: string | null;
  delivery_number: string | null;
  link_map?: string;
  channel: "baileys" | "instagram";
  contact?: string;
  adjustments: {
    type: "in" | "out";
    label: string;
    amount: string;
  }[];
  status: TypeStatusOrder;
  priority: TypePriorityOrder | null;
  data: string | null;
  sub_total: number | null;
  net_total: number | null;
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
            ? "linear-gradient(143deg,rgba(80, 168, 244, 0.97) 0%, rgba(170, 195, 255, 0.73) 100%)"
            : "linear-gradient(143deg, rgba(227, 255, 91, 0.74) 0%, rgba(2, 137, 30, 0.87) 100%)",
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
            <ImConnection color={"#044c09"} size={12} />
          ) : (
            <MdSignalWifiConnectedNoInternet0 color={"#f17b7b"} size={12} />
          )}
          <span
            className={tk.connection.s ? "text-[#044c09]" : "text-[#aa2727]"}
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
          <MdSupportAgent size={20} color="#0969BC" />
        ) : (
          <BiTimeFive size={20} color="#ed560c" />
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
  isNext,
  onNext,
}: {
  order: Order;
  isOverlay?: boolean;
  onOpenDialog: (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => void;
  onCloseDialog: () => void;
  onNext?(id: number): void;
  isNext?: boolean;
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
    disabled: order.isDragDisabled,
  });
  const [actionsLoad, setActionsLoad] = useState<string[]>([]);
  const [openData, setOpenData] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
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

  const composedTransition = [
    transition,
    "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
  ]
    .filter(Boolean)
    .join(", ");

  const liftOffset = !isDragging && isOverlay ? { scale: 0.98 } : { scale: 1 };

  const base = transform ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 };

  const composedTransform = {
    x: base.x,
    y: base.y,
    scaleX: base.scaleX * liftOffset.scale,
    scaleY: base.scaleY * liftOffset.scale,
  };

  return (
    <div
      ref={setNodeRef}
      className="relative text-black"
      {...attributes}
      {...listeners}
    >
      {order.isDragDisabled && (
        <BsFillLockFill className="absolute right-2 -top-0.5 text-red-400 z-20" />
      )}
      <div
        className={clsx("select-none relative rounded-sm")}
        style={{
          transform: CSS.Transform.toString(composedTransform),
          transition: composedTransition,
          backgroundColor: !isDragging ? "#fff" : "#ececec15",
          marginBottom: "6px",
          zIndex: !isDragging ? 1 : "auto",
          boxShadow:
            !isDragging && isOverlay
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
              : "none",
          opacity: order.isDragDisabled ? 0.4 : 1,
          overflow: "hidden",
        }}
      >
        <div
          className={clsx(
            "relative gap-1 pb-2",
            !isOverlay && isDragging ? "opacity-0" : "opacity-100",
            // isOver && "opacity-0",
          )}
        >
          <div
            onClick={() => setOpenData(!openData)}
            className="bg-neutral-100 px-2 py-2 pb-0.5 flex w-full mb-0 items-center gap-x-1 justify-between"
          >
            <div className="flex items-center gap-x-1.5">
              {order.link_map && (
                <a
                  href={order.link_map}
                  target="_blank"
                  className="text-blue-400"
                >
                  <TbMapShare size={20} />
                </a>
              )}
              <span className="text-black/55 text-sm font-semibold">
                #{order.n_order}
              </span>
            </div>

            <span className="text-black/35 text-xs sm:text-sm">
              {previewDateLastMsg}
            </span>
          </div>
          {order.data ? (
            <div className="bg-neutral-100 relative gap-y-1 cursor-pointer duration-200 w-full">
              <div className="w-full border-dashed border-zinc-600" />
              <Collapsible.Root open={openData} collapsedHeight="52px">
                <Collapsible.Content
                  _closed={{
                    shadow: "inset 0 -20px 12px -12px var(--shadow-color)",
                    shadowColor: "blackAlpha.50",
                  }}
                  onClick={() => setOpenData(!openData)}
                >
                  <p className="leading-4 text-[13px] sm:text-sm p-1 px-2">
                    {parse(format(order.data))}
                  </p>
                </Collapsible.Content>
              </Collapsible.Root>
              <div className="border-b w-full border-neutral-200" />
            </div>
          ) : (
            <div className="border-b-2 my-2 w-full border-dashed border-zinc-600/40" />
          )}

          <Collapsible.Root open={openInfo} collapsedHeight="43px">
            <Collapsible.Content
              className="pb-2 bg-neutral-50"
              onClick={() => setOpenInfo(!openInfo)}
            >
              <div className="flex gap-x-1 mt-1 justify-center items-center mb-1 text-neutral-400">
                <span className="text-xs text-center">ficha técnica</span>
                {openInfo ? <RxEyeOpen size={12} /> : <RxEyeClosed size={12} />}
              </div>
              {(order.name || order.description || order.contact) && (
                <div className="px-2 flex flex-col mb-2 w-full">
                  <span className="text-sm font-normal w-full">
                    {order.name}
                  </span>
                  <span className="text-sm font-light text-neutral-600 w-full">
                    {order.contact}
                  </span>
                  {order.description && (
                    <span className="text-black/60 text-xs sm:text-sm w-full">
                      {order.description}
                    </span>
                  )}
                </div>
              )}

              {order.payment_method && (
                <div className="px-2 flex-col flex items-start mt-1 gap-x-0.5 text-black/60">
                  <div className="text-sm flex items-center space-x-0.5">
                    <span className="text-xs text-neutral-400">Pagar com</span>{" "}
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                  {order.payment_change_to &&
                    order.payment_change_to === "Não" && (
                      <span className="text-xs bg-red-200 px-0.5 font-medium">
                        Não precisa de troco
                      </span>
                    )}
                  {order.payment_change_to &&
                    order.payment_change_to !== "Não" && (
                      <span className="text-xs bg-red-200/70 px-0.5 font-medium">
                        Troco para: {order.payment_change_to}
                      </span>
                    )}
                </div>
              )}
              <div className="px-2 flex flex-col gap-y-0.5 mt-2 items-start">
                {order.delivery_cep && (
                  <div className="text-sm flex items-center space-x-0.5">
                    <span className="text-xs text-neutral-400">Cep</span>
                    <span className="w-full leading-3.5 text-neutral-600">
                      {order.delivery_cep}
                    </span>
                  </div>
                )}
                {order.delivery_address && (
                  <div className="text-sm flex flex-col -space-y-0.5">
                    <span className="text-xs text-neutral-400">Endereço</span>
                    <span className="w-full leading-3.5 text-neutral-600">
                      {order.delivery_address}
                    </span>
                  </div>
                )}

                {order.delivery_reference_point && (
                  <span className="text-xs bg-amber-300/50 mt-1">
                    "{order.delivery_reference_point}"
                  </span>
                )}
                {order.delivery_complement && (
                  <div className="text-sm flex flex-col -space-y-0.5">
                    <span className="text-xs text-neutral-400">
                      Complemento
                    </span>
                    <span className="w-full leading-3.5 text-neutral-600">
                      {order.delivery_complement}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-2 flex flex-col w-full mt-2 text-xs sm:text-sm">
                {/* TOTAL ORIGINAL */}
                {order.sub_total && (
                  <div className="flex text-xs text-black/70 justify-between font-medium">
                    <span>Subtotal</span>
                    <span>{formatToBRL(order.sub_total)}</span>
                  </div>
                )}

                {/* AJUSTES */}
                {order.adjustments?.length > 0 && (
                  <div className="text-xs -space-y-0.5">
                    {order.adjustments.map((adj, index) => {
                      const isOut = adj.type === "out";

                      return (
                        <div
                          key={index}
                          className="flex justify-between text-black/70"
                        >
                          <span>{adj.label}</span>
                          <span
                            className={
                              isOut ? "text-red-700" : "text-green-700"
                            }
                          >
                            {isOut ? "-" : "+"}{" "}
                            {formatToBRL(Number(adj.amount))}
                          </span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between mt-1 text-black/70">
                      <span>Total líquido</span>
                      <span className="text-yellow-700">
                        {formatToBRL(Number(order.net_total))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          {order.total && (
            <div
              onClick={() => {
                setOpenInfo(!openInfo);
              }}
              className="flex text-sm bg-neutral-50 px-2 justify-between font-medium pt-1"
            >
              <span>Total a pagar</span>
              <span className="text-green-700 font-extrabold!">
                {formatToBRL(order.total)}
              </span>
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
            <div className="flex flex-col items-center mt-1 w-full">
              {/* <span className="text-xs text-center font-semibold text-white/70">
                        - Ações do pedido -
                      </span> */}
              <div className="w-full grid grid-cols-2 gap-x-1 px-1">
                {order.actionChannels.map((a, index) => (
                  <button
                    key={index}
                    className="w-full font-medium py-1 px-1 text-xs bg-slate-400/20 mb-2 cursor-pointer rounded-sm shadow"
                    onClick={() => {
                      if (!actionsLoad.includes(a)) {
                        const state = confirm(
                          `Deseja executar "${a}" para o pedido #${order.n_order}?`,
                        );
                        if (state) {
                          run(a);
                        }
                      }
                    }}
                    disabled={actionsLoad.includes(a)}
                  >
                    {actionsLoad.includes(a) ? <Spinner size={"xs"} /> : a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isNext && (
            <div className="flex flex-col items-center mt-1 w-full">
              <div className="w-full gap-x-1 px-1 flex justify-end">
                <button
                  className="font-medium py-1 px-1 text-sm flex items-center gap-x-1 justify-center bg-green-500 text-white cursor-pointer rounded-sm shadow"
                  onClick={() => onNext?.(order.id)}
                >
                  <span>Avançar</span> <TbPlayerTrackNext size={20} />
                </button>
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
  onNext?(id: number): void;
  isNext?: boolean;
}

export function Container(props: ContainerProps) {
  const { setNodeRef } = useDroppable({ id: props.column.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "100%",
        minWidth: "220px",
        background: opacity(props.column.color, 0.06),
      }}
      className="grid grid-rows-[40px_1fr] sm:grid-rows-[50px_1fr] px-1.5 pt-1.5 select-none sm:w-52 sm:min-w-52 min-w-44 w-44"
    >
      <div className="">
        <div
          style={{
            background: props.column.color,
          }}
          className="gap-1 p-2 sticky top-0 z-50 sm:p-3 rounded-sm flex items-center sm:rounded-md justify-between"
        >
          <span
            className="text-base"
            style={{ color: fontColorContrast(props.column.color + "72") }}
          >
            {props.column.name}
          </span>
          <Circle p={"1px"} px={"7px"} fontSize={"13px"} bg={"#6d6d6d2c"}>
            {props.rows?.length || 0}
          </Circle>
        </div>
      </div>

      <div className={clsx("pb-10 flex-1 py-2 scroll-custom overflow-y-auto")}>
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
              isNext={props.isNext}
              onNext={props.onNext}
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
  // { label: "A confirmar ...", value: "draft", color: "#f5f5f533" },
  // { label: "Pendentes", value: "pending", color: "#f5f5f533" },
  { label: "Em espera", value: "confirmed", color: "#0EA5E933" },
  { label: "PREPARANDO", value: "processing", color: "#F9731633" },
  { label: "Prontos pra entrega", value: "ready", color: "#22C55E33" },
  { label: "A caminho", value: "on_way", color: "#3B82F633" },
  { label: "Concluídos", value: "completed", color: "#14B8A633" },
];

export const OrdersPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { logout, clientMeta } = useContext(AuthContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});
  const [orders, setOrders] = useState<{ [x: string]: Order[] }>(
    {} as { [x: string]: Order[] },
  );
  const [load, setLoad] = useState(true);
  const [itemStartDrag, setItemStartDrag] = useState<{
    column: string;
    index: number;
    id: number;
  } | null>(null);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  // const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(
      clientMeta.isMobileLike ? TouchSensor : PointerSensor,
      clientMeta.isMobileLike
        ? {
            activationConstraint: {
              delay: 250,
              tolerance: 8,
              distance: 5,
            },
          }
        : { activationConstraint: { distance: 1 } },
    ),
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
      setItemStartDrag({
        column: container,
        index: active.data.current?.sortable.index!,
        id: Number(active.id),
      });
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
    const { over } = event;
    const overId = over?.id;

    if (!overId) return;

    const overContainer = findContainer(overId as string);

    if (itemStartDrag && overContainer) {
      if (itemStartDrag.column !== overContainer) {
        setOrders((prev) => {
          const overItems = prev[overContainer];
          let overIndex = 0;
          if (typeof overId === "string") {
            overIndex = overItems.length;
          } else {
            overIndex = overItems.findIndex((item) => item.id === overId);
            if (overIndex < 0) {
              overIndex = overItems.length;
            }
          }

          const prevRank = overItems[overIndex - 1]
            ? { sequence: overItems[overIndex - 1].sequence }
            : undefined;
          const nextRank = overItems[overIndex + 1]
            ? { sequence: overItems[overIndex + 1].sequence }
            : undefined;

          const newRank = calcRank(prevRank, nextRank);

          const nextOrdersDest = overItems.map((c) => {
            if (c.id === itemStartDrag.id) c.sequence = newRank;
            return c;
          });
          socket.emit("order:update_status", {
            rank: newRank,
            orderId: itemStartDrag.id,
            nextIndex: overIndex,
            sourceStatus: itemStartDrag.column,
            nextStatus: overContainer,
          });

          return {
            ...prev,
            [overContainer]: nextOrdersDest,
          };
        });
      } else {
        setOrders((prev) => {
          const column = prev[overContainer];
          const activeIndex = column.findIndex(
            (item) => item.id === itemStartDrag.id,
          );
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
          socket.emit("order:update_rank", {
            rank: newRank,
            orderId: itemStartDrag.id,
            nextIndex: overIndex,
            status: overContainer,
          });
          const nextOrdersDest = column.map((c) => {
            if (c.id === itemStartDrag.id) c.sequence = newRank;
            return c;
          });
          return {
            ...prev,
            [itemStartDrag.column]: arrayMove(
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

  const handleNext = (
    columnStart: string,
    columnEnd: string,
    itemId: number,
  ) => {
    setOrders((prev) => {
      const activeItems = prev[columnStart];
      const activeIndex = activeItems.findIndex((s) => s.id === itemId);
      const overItems = prev[columnEnd];
      let overIndex = overItems.length;

      const itemRemoved = activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, itemRemoved[0]);

      const prevRank = overItems[overIndex - 1]
        ? { sequence: overItems[overIndex - 1].sequence }
        : undefined;
      const nextRank = overItems[overIndex + 1]
        ? { sequence: overItems[overIndex + 1].sequence }
        : undefined;

      const newRank = calcRank(prevRank, nextRank);
      const nextOrdersDest = overItems.map((c) => {
        if (c.id === itemId) c.sequence = newRank;
        return c;
      });

      socket.emit("order:update_status", {
        rank: newRank,
        orderId: itemId,
        nextIndex: overIndex,
        sourceStatus: columnStart,
        nextStatus: columnEnd,
      });

      return {
        ...prev,
        [columnStart]: activeItems.filter((item) => item.id !== itemId),
        [columnEnd]: nextOrdersDest,
      };
    });
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
          // "draft",
          // "pending",
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

        const nextListStatus = Object.fromEntries(
          Object.entries(stateClone).map(([status, ordersList]) => {
            return [
              status,
              ordersList.map((or) => {
                if (order.id === or.id) or = { ...or, ...order };
                return or;
              }),
            ];
          }),
        );

        return nextListStatus;
      });
    });

    socket.on("delete_order", (order: Pick<Order, "id" | "status">) => {
      setOrders((state) => {
        const stateClone = structuredClone(state);
        const nextListStatus = Object.fromEntries(
          Object.entries(stateClone).map(([status, ordersList]) => {
            return [status, ordersList.filter((or) => or.id !== order.id)];
          }),
        );
        return nextListStatus;
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
      socket.off("delete_order");
    };
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col px-2">
      <div className="flex flex-col sm:pl-0 pl-2">
        <div className="flex items-center gap-x-2 sm:gap-x-5">
          <h1 className="text-base sm:text-lg font-semibold">Pedidos</h1>
        </div>
      </div>
      <div className="flex-1 pt-0! grid gap-x-2 h-full">
        {load ? (
          <div className="bg-white/5 sm:m-0 m-2 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <div className="md:h-[calc(100svh-110px)] sm:h-[calc(100svh-165px)] h-[calc(100svh-130px)] flex overflow-x-auto touch-pan-x">
            <DndContext
              sensors={sensors}
              // collisionDetection={closestCorners}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {columns?.map((column, index) => {
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
                    isNext={!(columns.length - 1 === index)}
                    onNext={(id) =>
                      columns[index + 1]?.value
                        ? handleNext(column.value, columns[index + 1].value, id)
                        : undefined
                    }
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
