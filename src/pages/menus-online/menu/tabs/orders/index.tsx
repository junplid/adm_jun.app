import {
  FC,
  JSX,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Circle,
  Grid,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  getOrders,
  runActionOrder,
  TypePriorityOrder,
  TypeStatusOrder,
} from "../../../../../services/api/Orders";
import { AuthContext } from "@contexts/auth.context";
import { SocketContext } from "@contexts/socket.context";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { VirtuosoGrid } from "react-virtuoso";
import { Tooltip } from "@components/ui/tooltip";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import moment from "moment";
import { formatToBRL } from "brazilian-values";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import fontColorContrast from "font-color-contrast";

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

const columns: {
  label: string;
  value: TypeStatusOrder;
  color: string;
}[] = [
  { label: "Pendentes", value: "pending", color: "#F59E0B33" },
  { label: "Aguardando", value: "confirmed", color: "#0EA5E933" },
  { label: "Preparando", value: "processing", color: "#F9731633" },
  { label: "Pedidos prontos", value: "ready", color: "#22C55E33" },
  { label: "A caminho", value: "on_way", color: "#3B82F633" },
  { label: "Finalizados(24h)", value: "completed", color: "#14B8A633" },
];

export interface IColumnKanban {
  id: number;
  name: string;
  color: string;
  rows: Order[];
}

export interface IDataKanban {
  columns: IColumnKanban[];
}

interface PropsFilter {
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
}

const TabOrders_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const { socket, ns } = useContext(SocketContext);
  const [orders, setOrders] = useState<{ [x: string]: Order[] }>(
    {} as { [x: string]: Order[] }
  );
  const { logout, account } = useContext(AuthContext);
  const [filter, setFilter] = useState<PropsFilter>({});
  const [load, setLoad] = useState(false);
  // const [kanban, setKanban] = useState<IDataKanban>({
  //   columns: columns.map(s=>({name: s.})),
  // } as IDataKanban);
  const [loadMoveTicket, setLoadMoveTicket] = useState<number | null>(null);

  async function get(props: PropsFilter) {
    try {
      setLoad(true);
      const { orders: oL } = await getOrders({
        limit: 15,
        menu: uuid,
      });
      setOrders(oL);
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
    get(filter);
  }, [filter]);

  const socketNS = useMemo(() => {
    return ns(`/menu-${uuid}/orders`, {
      auth: { accountId: account.id },
      timeout: 3000,
    });
  }, [socket]);

  useEffect(() => {
    if (socketNS) {
      socketNS.on(
        "list",
        (props: {
          accountId: number;
          action: "new" | "update";
          order: Order;
        }) => {
          if (props.accountId === account.id) {
            if (props.action === "new") {
              if (
                (!filter.status && !filter.priority) ||
                (filter.status === props.order.status && !filter.priority) ||
                (filter.priority === props.order.priority && !filter.status) ||
                (filter.priority === props.order.priority &&
                  filter.status === props.order.status)
              ) {
                // setOrders((orders) => [...orders, props.order]);
              }
            } else {
              // setOrders((orders) =>
              //   orders.map((order) => {
              //     if (order.id === props.order.id) {
              //       return { ...order, ...props.order };
              //     }
              //     return order;
              //   })
              // );
            }
          }
        }
      );
    }
  }, [socketNS]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const optionsAxios = {
      // headers: { Authorization: cookies.auth_atten },
    };
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // const start = kanban.columns.find(
    //   (cl) => cl.id === Number(source.droppableId)
    // );
    // const finish = kanban.columns.find(
    //   (c) => c.id === Number(destination.droppableId)
    // );
    setLoadMoveTicket(Number(draggableId));
    // if (start && finish && start.id === finish.id) {
    //   const nextRows = Array.from(start.rows);
    //   nextRows.splice(source.index, 1);
    //   nextRows.splice(destination.index, 0, {
    //     ...start.rows[source.index],
    //     sequence: destination.index + 1,
    //   });
    //   const nnNextRows = nextRows.map((s, i) => {
    //     s.sequence = i + 1;
    //     return s;
    //   });
    //   const nextColumn = { ...start, rows: nnNextRows };
    //   const nextColumns = kanban.columns.map((cl) =>
    //     cl.id === start.id ? nextColumn : cl
    //   );
    //   setKanban((kb) => ({ ...kb, columns: nextColumns }));
    //   await api.put(
    //     `/human-service/funnel-kanban-ticket/${kanban.id}`,
    //     {
    //       columns: [
    //         {
    //           id: nextColumn.id,
    //           rows: nextColumn.rows.map((r) => ({
    //             newSequence: r.sequence,
    //             ticketId: r.id,
    //           })),
    //         },
    //       ],
    //     },
    //     optionsAxios
    //   );
    //   await new Promise((resolve) => setTimeout(resolve, 700));
    //   setLoadMoveTicket(null);
    //   return;
    // }

    // if (start && finish) {
    //   const startRows = Array.from(start.rows);
    //   startRows.splice(source.index, 1);
    //   const finishRows = Array.from(finish.rows);
    //   finishRows.splice(destination.index, 0, start.rows[source.index]);
    //   const nnNextRowsStart = startRows.map((s, i) => {
    //     if (start.rows[source.index].id === s.id) {
    //       // @ts-expect-error
    //       s.delete = true;
    //       s.sequence = i + 1;
    //       return s;
    //     }
    //     // @ts-expect-error
    //     s.delete = false;
    //     s.sequence = i + 1;
    //     return s;
    //   });
    //   const nnNextRowsFinish = finishRows.map((s, i) => {
    //     if (start.rows[source.index].id === s.id) {
    //       // @ts-expect-error
    //       s.delete = true;
    //       s.sequence = i + 1;
    //       return s;
    //     }
    //     // @ts-expect-error
    //     s.delete = false;
    //     s.sequence = i + 1;
    //     return s;
    //   });
    //   const nextStart = { ...start, rows: nnNextRowsStart };
    //   const nextFinish = { ...finish, rows: nnNextRowsFinish };
    //   const nextColumns = kanban.columns.map((cl) =>
    //     cl.id === start.id ? nextStart : cl.id === finish.id ? nextFinish : cl
    //   );
    //   setKanban((kb) => ({ ...kb, columns: nextColumns }));
    //   await api.put(
    //     `/human-service/funnel-kanban-ticket/${kanban.id}`,
    //     {
    //       columns: [
    //         {
    //           id: nextStart.id,
    //           rows: nextStart.rows.map((r) => ({
    //             //@ts-expect-error
    //             delete: r.delete,
    //             newSequence: r.sequence,
    //             ticketId: r.id,
    //           })),
    //         },
    //         {
    //           id: nextFinish.id,
    //           rows: nextFinish.rows.map((r) => ({
    //             //@ts-expect-error
    //             delete: r.delete,
    //             newSequence: r.sequence,
    //             ticketId: r.id,
    //           })),
    //         },
    //       ],
    //     },
    //     optionsAxios
    //   );
    //   await new Promise((resolve) => setTimeout(resolve, 700));
    //   setLoadMoveTicket(null);
    // }
  }, []);

  return (
    <div className="flex-1 !pt-0 grid gap-x-2 h-full">
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
                    loadMoveTicket={loadMoveTicket}
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
  );
};

interface ColumnProps {
  column: { id: string; name: string; color: string };
  rows: Order[];
  loadMoveTicket: number | null;
}

const Column: FC<ColumnProps> = ({ column, rows, loadMoveTicket }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <Grid h={"100%"} minW={"210px"} w={"210px"} templateRows={"50px 1fr"}>
      <div
        style={{ background: column.color }}
        className="gap-1.5 p-3 rounded-md"
      >
        <HStack w={"100%"} justifyContent={"space-between"}>
          <Text color={fontColorContrast(column.color + "72")}>
            {column.name}
          </Text>
          <Circle p={"1px"} px={"13px"} fontSize={"14px"} bg={"#6d6d6d2c"}>
            1
          </Circle>
        </HStack>
      </div>

      <Droppable direction="vertical" droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`p-2 px-0 duration-200 flex-1 h-full ${
              snapshot.isDraggingOver ? "bg-gray-500/5" : ""
            }`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div
              className={`respon-column scroll-custom overflow-y-scroll flex-1 h-full`}
            >
              {rows?.map((row, index) => (
                <Taks
                  loadMoveTicket={loadMoveTicket}
                  {...row}
                  index={index}
                  key={row.id}
                />
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

export const Taks: FC<
  Order & { index: number; loadMoveTicket: number | null }
> = ({ id, index, ...props }) => {
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
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <Box
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            userSelect: "none",
            margin: `0 0 ${8}px 0`,
            ...provided.draggableProps.style,
          }}
        >
          <VStack
            bg={snapshot.isDragging ? "#2a2a2a" : "#1e1e1e"}
            shadow={snapshot.isDragging ? "lg" : "none"}
            transitionDuration={"300ms"}
            alignItems={"start"}
            className="relative"
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
              <div className="px-2 pb-2 flex font-bold text-sm items-center justify-between w-full gap-x-1">
                <span>Sub total</span>
                <span>{formatToBRL(props.total)}</span>
              </div>
            )}
            {!!props.actionChannels?.length && (
              <div className="flex flex-col items-center mt-2">
                <span className="text-xs font-semibold text-black/80">
                  - Ações do pedido -
                </span>
                <div className="w-full grid grid-cols-2 gap-x-2 px-2 pt-1">
                  {props.actionChannels.map((a, index) => (
                    <button
                      key={index}
                      className="w-full hover:font-medium bg-teal-500 py-2 px-1 hover:bg-teal-600 cursor-pointer rounded-lg shadow"
                      onClick={() => !actionsLoad.includes(a) && run(a)}
                      disabled={actionsLoad.includes(a)}
                    >
                      {actionsLoad.includes(a) ? <Spinner size={"xs"} /> : a}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <img
              src="/note.svg"
              alt=""
              className="absolute w-full left-0 -bottom-1"
            />
          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

export const TabOrders = memo(TabOrders_);
