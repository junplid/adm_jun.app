import {
  FC,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  // useMemo,
  useState,
} from "react";
// import { ModalCreateBusiness } from "./modals/create";
import { Spinner, Grid, Circle, Box, VStack } from "@chakra-ui/react";
// import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../hooks/dialog.modal";
// import SelectComponent from "@components/Select";
// import { Field } from "@components/ui/field";
import {
  getOrders,
  runActionOrder,
  // getOrders,
  // runActionOrder,
  TypePriorityOrder,
  TypeStatusOrder,
} from "../../services/api/Orders";
import { AuthContext } from "@contexts/auth.context";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
// import { VirtuosoGrid } from "react-virtuoso";
import { SocketContext } from "@contexts/socket.context";
// import { format } from "@flasd/whatsapp-formatting";
// import parse from "html-react-parser";
// import moment from "moment";
// import { Tooltip } from "@components/ui/tooltip";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import fontColorContrast from "font-color-contrast";
import { formatToBRL } from "brazilian-values";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import moment from "moment";

export interface Order {
  id: number;
  name: string | null;
  n_order: string;
  createAt: Date;
  delivery_address: string | null;
  payment_method: string | null;
  actionChannels: string[];
  contact?: string;
  status: TypeStatusOrder;
  priority: TypePriorityOrder | null;
  data: string | null;
  total: string | null;
  sequence: number;
}

export interface Order {
  id: number;
  name: string | null;
  n_order: string;
  createAt: Date;
  delivery_address: string | null;
  payment_method: string | null;
  actionChannels: string[];
  contact?: string;
  status: TypeStatusOrder;
  priority: TypePriorityOrder | null;
  data: string | null;
  total: string | null;
  sequence: number;
  isDragDisabled: boolean;
}

const columns: {
  label: string;
  value: TypeStatusOrder;
  color: string;
}[] = [
  { label: "Pendentes", value: "pending", color: "#F59E0B33" },
  { label: "Aguardando", value: "confirmed", color: "#0EA5E933" },
  { label: "Preparando", value: "processing", color: "#F9731633" },
  { label: "Prontos", value: "ready", color: "#22C55E33" },
  { label: "A caminho", value: "on_way", color: "#3B82F633" },
  { label: "Finalizados", value: "completed", color: "#14B8A633" },
];

function calcRank(prev?: Order, next?: Order) {
  const GAP = 640;
  let newRank: number;

  if (!prev && !next) {
    newRank = GAP;
  } else if (!prev && next) {
    newRank = next.sequence - GAP;
    console.log({ newRank });
  } else if (!next && prev) {
    newRank = prev.sequence + GAP;
  } else {
    newRank = (prev!.sequence + next!.sequence) / 2;
  }

  return newRank;
}

export const OrdersPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { dialog: DialogModal } = useDialogModal({});
  const [orders, setOrders] = useState<{ [x: string]: Order[] }>(
    {} as { [x: string]: Order[] }
  );
  const { logout, account } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [_loadOrders, _setLoadOrders] = useState<number[]>([]);

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      if (destination.index === source.index) return;

      const copyOrders = structuredClone(orders);
      const reordered = copyOrders[source.droppableId];

      const itemDeleted = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, itemDeleted[0]);

      const prev = reordered[destination.index - 1];
      const next = reordered[destination.index + 1];

      const newRank = calcRank(prev, next);
      const nextOrders = reordered.map((c) => {
        if (c.id === itemDeleted[0].id) {
          c.sequence = newRank;
        }
        return c;
      });

      setOrders((state) => {
        const nextstt = structuredClone(state);
        nextstt[source.droppableId] = nextOrders;
        return nextstt;
      });

      socket.emit("order:update-rank", {
        sourceIndex: source.index,
        nextIndex: destination.index,
        rank: newRank,
        status: source.droppableId,
        orderId: itemDeleted[0].id,
      });

      return;
    }

    const copyOrders = structuredClone(orders);
    const ordersStart = copyOrders[source.droppableId];

    const [itemDeleted] = ordersStart.splice(source.index, 1);

    const ordersDest = copyOrders[destination.droppableId];
    ordersDest.splice(destination.index, 0, itemDeleted);

    const prev = ordersDest[destination.index - 1];
    const next = ordersDest[destination.index + 1];

    const newRank = calcRank(prev, next);
    const nextOrdersDest = ordersDest.map((c) => {
      if (c.id === itemDeleted.id) c.sequence = newRank;
      return c;
    });

    setOrders((state) => {
      const nextstt = structuredClone(state);
      nextstt[source.droppableId] = ordersStart;
      nextstt[destination.droppableId] = nextOrdersDest;
      return nextstt;
    });

    socket.emit("order:update-status", {
      sourceIndex: source.index,
      nextIndex: destination.index,
      rank: newRank,
      orderId: itemDeleted.id,
      sourceStatus: source.droppableId,
      nextStatus: destination.droppableId,
    });
  };

  useEffect(() => {
    get();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("order:new", (props: { accountId: number; order: Order }) => {
        if (props.accountId === account.id) {
          setOrders((state) => {
            const stateClone = structuredClone(state);
            stateClone[props.order.status].push(props.order);
            return stateClone;
          });
        }
      });

      socket.on(
        "order:update-rank",
        (props: {
          accountId: number;
          sourceIndex: number;
          nextIndex: number;
          rank: number;
          status: TypeStatusOrder;
          orderId: number;
        }) => {
          if (props.accountId === account.id) {
            setOrders((state) => {
              const copyState = structuredClone(state);
              const reordered = copyState[props.status];
              const [itemDeleted] = reordered.splice(props.sourceIndex, 1);
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
          }
        }
      );

      socket.on(
        "order:update-status",
        (props: {
          accountId: number;
          sourceIndex: number;
          nextIndex: number;
          rank: number;
          sourceStatus: TypeStatusOrder;
          nextStatus: TypeStatusOrder;
          orderId: number;
        }) => {
          if (props.accountId === account.id) {
            setOrders((state) => {
              const copyState = structuredClone(state);
              const ordersStart = copyState[props.sourceStatus];
              const [itemDeleted] = ordersStart.splice(props.sourceIndex, 1);
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
          }
        }
      );
    }

    return () => {
      socket.off("order:new");
    };
  }, [socket]);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col">
        <div className="flex items-center gap-x-2 sm:gap-x-5">
          <h1 className="text-base sm:text-lg font-semibold">Pedidos</h1>
          <strong className="text-yellow-600 text-sm">
            <span className="text-xs">⚠️</span> Em desenvolvimento
          </strong>
          {/* <ModalCreateBusiness
            trigger={
              <Button disabled variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          /> */}
        </div>
        <p className="text-white/60 font-light sm:text-base text-sm">
          Centralize seus pedidos em um único lugar.
        </p>
      </div>
      {/* <div className="grid grid-cols-[240px_1fr] gap-x-2 h-full">
        <div className="px-3 pt-5 bg-zinc-800/15 flex flex-col gap-y-3 rounded-md">
          <span className="block font-medium">Filtrar</span>
          <Field label={"Status do pedido"}>
            <SelectComponent
              options={optionsStatus}
              placeholder="Todos"
              value={
                filter.status
                  ? {
                      label:
                        optionsStatus.find((s) => s.value === filter.status)
                          ?.label || "",
                      value: filter.status,
                    }
                  : null
              }
              onChange={(vl: any) => {
                if (!vl) {
                  setFilter({ ...filter, status: undefined });
                  return;
                }
                setFilter({ ...filter, status: vl.value });
              }}
            />
          </Field>
          <Field label={"Prioridade"}>
            <SelectComponent
              options={optionsPriority}
              placeholder="Todas"
              value={
                filter.priority
                  ? {
                      label:
                        optionsPriority.find((s) => s.value === filter.priority)
                          ?.label || "",
                      value: filter.priority,
                    }
                  : null
              }
              onChange={(vl: any) => {
                if (!vl) {
                  setFilter({ ...filter, priority: undefined });
                  return;
                }
                setFilter({ ...filter, priority: vl.value });
              }}
            />
          </Field>
          {!!orders.length && (
            <span className="text-white/50 mt-10 text-center">
              {orders.length > 1
                ? `${orders.length} pedidos encontrados*`
                : `${orders.length} pedido encontrado*`}
            </span>
          )}
        </div>
        {load ? (
          <div className="bg-white/5 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <>
            {orders?.length ? (
              <VirtuosoGrid
                style={{ height: "100%", maxHeight: "calc(100vh - 180px)" }}
                data={orders}
                className="scroll-custom-table"
                //  endReached={() => {
                //    if (hasNextPage) fetchNextPage()
                //  }}
                overscan={300}
                listClassName="group grid flex-1 items-baseline grid-cols-[repeat(auto-fill,minmax(230px,1fr))]"
                itemContent={(_index, order) => (
                  <OrderItem key={order.id} {...order} />
                )}
              />
            ) : (
              <div className="bg-white/5 text-white/70 rounded-md flex items-center justify-center">
                <span className="">Seus pedidos aparecerão aqui.</span>
              </div>
            )}
          </>
        )}
      </div> */}
      <div className="flex-1 pt-0! grid gap-x-2 h-full">
        {load ? (
          <div className="bg-white/5 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <>
            {/* {orders?.length ? (
                  <VirtuosoGrid
                    style={{ height: "100%", maxHeight: "calc(100vh - 180px)" }}
                    data={orders}
                    className="scroll-custom-table"
                    //  endReached={() => {
                    //    if (hasNextPage) fetchNextPage()
                    //  }}
                    overscan={300}
                    listClassName="group grid flex-1 items-baseline grid-cols-[repeat(auto-fill,minmax(230px,1fr))]"
                    itemContent={(_index, order) => (
                      <OrderItem key={order.id} {...order} />
                    )}
                  />
                ) : (
                  <div className="bg-white/5 text-white/70 rounded-md flex items-center justify-center">
                    <span className="">Seus pedidos aparecerão aqui.</span>
                  </div>
                )} */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="remove-scroll overflow-x-auto flex space-x-2">
                {columns?.map((column) => {
                  return (
                    <Column
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
              </div>
            </DragDropContext>
          </>
        )}
      </div>
      {DialogModal}
    </div>
  );
};

interface ColumnProps {
  column: { id: string; name: string; color: string };
  rows: Order[];
  loadMoveTicket: number | null;
}

const Column: FC<ColumnProps> = ({ column, rows }) => {
  // const [searchValue, setSearchValue] = useState("");

  return (
    <Grid
      h={"100%"}
      minW={"203px"}
      w={"203px"}
      templateRows={"40px 1fr"}
      sm={{ gridTemplateRows: "50px 1fr" }}
    >
      <div
        style={{ background: column.color }}
        className="gap-1.5 p-2 sticky top-0 z-50 sm:p-3 rounded-sm flex items-center sm:rounded-md justify-between"
      >
        <span
          className="text-sm sm:text-base"
          style={{ color: fontColorContrast(column.color + "72") }}
        >
          {column.name}
        </span>
        <Circle p={"1px"} px={"13px"} fontSize={"14px"} bg={"#6d6d6d2c"}>
          {rows?.length || 0}
        </Circle>
      </div>

      <Droppable
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping
        direction="vertical"
        droppableId={column.id}
      >
        {(provided, snapshot) => (
          <div
            className={`p-2 px-0 duration-200 flex-1 h-full ${
              snapshot.isDraggingOver ? "bg-gray-500/5" : ""
            }`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div
              className={`respon-column scroll-custom overflow-y-scroll pb-10 flex-1 h-[calc(100svh-190px)]`}
            >
              {rows?.map((row, index) => (
                <Taks {...row} index={index} key={row.id} />
              ))}

              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </Grid>
  );
};

const diasDaSemana: { [x: number]: string } = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

export const Taks: FC<Order & { index: number }> = ({
  id,
  index,
  ...props
}) => {
  const [actionsLoad, setActionsLoad] = useState<string[]>([]);
  const { logout } = useContext(AuthContext);
  // const { user } = useContext(AuthorizationContext);
  const previewDateLastMsg = useMemo(() => {
    const days = moment().diff(props.createAt, "day");
    if (days === 0) {
      return moment(props.createAt).format("HH:mm");
    }
    if (days === 1) return "Ontem";
    if (days >= 2 || days <= 7) {
      return diasDaSemana[moment(props.createAt).day()];
    } else {
      return moment(props.createAt).format("DD/MM/YYYY");
    }
  }, [props.createAt]);

  const run = useCallback(
    async (action: string) => {
      if (actionsLoad.includes(action)) return;
      try {
        setActionsLoad([...actionsLoad, action]);
        await runActionOrder(id, action);
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
    [actionsLoad]
  );

  return (
    <Draggable
      isDragDisabled={props.isDragDisabled}
      draggableId={String(id)}
      index={index}
    >
      {(provided, snapshot) => (
        <Box
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            userSelect: "none",
            margin: `0 0 ${8}px 0`,
            opacity: props.isDragDisabled ? 0.5 : 1,
            ...provided.draggableProps.style,
            // border: false ? "2px inset #33d1b4" : "2px inset transparent",
          }}
        >
          <VStack
            bg={snapshot.isDragging ? "#2a2a2a" : "#1e1e1e"}
            shadow={snapshot.isDragging ? "lg" : "none"}
            transitionDuration={"300ms"}
            alignItems={"start"}
            className="relative"
            gap={1}
          >
            <div className="px-2 pt-2 flex w-full mb-1 items-center gap-x-1 justify-between">
              <span className="text-sm">#{props.n_order}</span>
              <span className="text-white/35 text-sm">
                {previewDateLastMsg}
              </span>
            </div>
            {props.name && (
              <div className="px-2 flex items-center justify-between gap-x-1 w-full">
                <span className="line-clamp-2 text-nowrap font-medium w-full">
                  {props.name}
                </span>
              </div>
            )}
            {props.data ? (
              <div className="relative gap-y-1 duration-200 bg-zinc-700/15 w-full">
                <div className="border-b-2 mb-1.5 w-full border-dashed border-zinc-600/40" />
                <p className="leading-5 text-sm p-1 px-2">
                  {parse(format(props.data))}
                </p>
                <div className="border-b-2 mt-1.5 w-full border-dashed border-zinc-600/40" />
              </div>
            ) : (
              <div className="border-b-2 my-2 w-full border-dashed border-zinc-600/40" />
            )}

            {props.total && (
              <div className="px-2 pb-2 flex font-bold text-sm items-center justify-end w-full gap-x-1">
                {/* <span>{formatToBRL(props.total)}</span> */}
                <span>R$ {props.total}</span>
              </div>
            )}
            {!!props.actionChannels?.length && (
              <div className="flex flex-col items-center w-full">
                {/* <span className="text-xs text-center font-semibold text-white/70">
                  - Ações do pedido -
                </span> */}
                <div className="w-full grid grid-cols-2 gap-x-1 px-1">
                  {props.actionChannels.map((a, index) => (
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
          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

// function OrderItem(props: OrderRow): JSX.Element {
//   const [actionsLoad, setActionsLoad] = useState<string[]>([]);
//   const { logout } = useContext(AuthContext);

//   const run = useCallback(
//     async (action: string) => {
//       if (actionsLoad.includes(action)) return;
//       try {
//         setActionsLoad([...actionsLoad, action]);
//         await runActionOrder(props.id, action);
//         setActionsLoad(actionsLoad.filter((s) => s !== action));
//       } catch (error) {
//         if (error instanceof AxiosError) {
//           if (error.response?.status === 401) logout();
//           if (error.response?.status === 400) {
//             const dataError = error.response?.data as ErrorResponse_I;
//             if (dataError.toast.length) dataError.toast.forEach(toaster.create);
//           }
//         }
//         throw error;
//       }
//     },
//     [actionsLoad]
//   );

//   const hasShadow: boolean = useMemo(() => {
//     return props.data ? props.data?.split("\n").length > 5 : false;
//   }, [props.data]);

//   return (
//     <div className="p-1 pb-1.5 transition-opacity duration-200 group-hover:opacity-40 hover:!opacity-90">
//       <article className="text-sm cursor-pointer relative leading-4 py-5 pb-3 bg-[#f0de9e] text-black">
//         <div className="flex justify-between px-2 mb-1 items-center">
//           <div className="flex items-center flex-wrap gap-x-1">
//             <span className="line-clamp-1 text-nowrap font-medium">
//               {optionsStatus.find((s) => s.value === props.status)?.label}
//             </span>
//           </div>
//           <span className="font-semibold">
//             {optionsPriority.find((s) => s.value === props.priority)?.label}
//           </span>
//         </div>
//         <div className="flex px-2 mb-1 items-center gap-x-1">
//           <span className="font-semibold text-base">#{props.n_order}</span>
//           <span className="text-black/70">
//             {moment(props.createAt).format("HH:mm DD/M/YYYY")}
//           </span>
//         </div>
//         {props.name && (
//           <div className="flex px-2 items-center justify-between gap-x-1">
//             <span>Nome</span>
//             <span className="line-clamp-1 text-nowrap">{props.name}</span>
//           </div>
//         )}
//         {props.payment_method && (
//           <div className="flex px-2 items-center justify-between gap-x-1">
//             <span>Método</span>
//             <span>{props.payment_method}</span>
//           </div>
//         )}
//         {props.delivery_address && (
//           <div className="flex flex-col px-2">
//             <span>Endereço de entrega</span>
//             <span>- {props.delivery_address || "RETIRAR NO LOCAL"}</span>
//           </div>
//         )}
//         <div className="flex px-2">
//           <span className="text-end block w-full">5571986751101</span>
//         </div>
//         {props.data ? (
//           <>
//             <Tooltip
//               contentProps={{
//                 css: {
//                   "--tooltip-bg": "#fff",
//                 },
//               }}
//               closeOnClick={false}
//               positioning={{ placement: "top", offset: { mainAxis: -30 } }}
//               closeOnScroll={false}
//               showArrow
//               content={
//                 <div className="flex flex-col">
//                   <span className="font-semibold text-base block mb-1">
//                     #{props.n_order}
//                   </span>
//                   <span>{parse(format(props.data))}</span>
//                 </div>
//               }
//             >
//               <div className="relative bg-[#f5e5ae] duration-200">
//                 <div className="border-b-2 my-2 border-dashed border-zinc-800/70" />
//                 <span className="px-2 line-clamp-5">
//                   {parse(format(props.data))}
//                 </span>
//                 {hasShadow && (
//                   <div
//                     className="absolute bottom-0 w-full h-10"
//                     style={{
//                       background:
//                         "linear-gradient(transparent 0%, #ddcc90 90%)",
//                     }}
//                   />
//                 )}
//               </div>
//             </Tooltip>
//             <div className="border-b-2 mb-2 border-dashed border-zinc-800/70" />
//           </>
//         ) : (
//           <div className="border-b-2 my-2 border-dashed border-zinc-800/70" />
//         )}
//         {props.total && (
//           <div className="flex px-2 items-center justify-between gap-x-1">
//             <span>Total</span>
//             <span>{props.total}</span>
//           </div>
//         )}
//         {/* <div className="flex px-2 items-center justify-between gap-x-1">
//           <span>Descontos</span>
//           <span>- 0,00</span>
//         </div> */}
//         {props.total && (
//           <div className="flex px-2 font-bold items-center justify-between gap-x-1">
//             <span>Sub total</span>
//             <span>{props.total}</span>
//           </div>
//         )}
//         {!!props.actionChannels?.length && (
//           <div className="flex flex-col items-center mt-2">
//             <span className="text-xs font-semibold text-black/80">
//               - Ações do pedido -
//             </span>
//             <div className="w-full grid grid-cols-2 gap-x-2 px-2 pt-1">
//               {props.actionChannels.map((a, index) => (
//                 <button
//                   key={index}
//                   className="w-full hover:font-medium bg-teal-500 py-2 px-1 hover:bg-teal-600 cursor-pointer rounded-lg shadow"
//                   onClick={() => !actionsLoad.includes(a) && run(a)}
//                   disabled={actionsLoad.includes(a)}
//                 >
//                   {actionsLoad.includes(a) ? <Spinner size={"xs"} /> : a}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//         <img src="/note.svg" alt="" className="absolute -bottom-1" />
//       </article>
//     </div>
//   );
// }
