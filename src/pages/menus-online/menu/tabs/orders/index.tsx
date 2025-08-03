import { useDialogModal } from "../../../../../hooks/dialog.modal";
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
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
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

export interface OrderRow {
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
}

const optionsStatus: { label: string; value: TypeStatusOrder }[] = [
  { label: "Rascunho", value: "draft" },
  { label: "Pendente", value: "pending" },
  { label: "Em processamento", value: "processing" },
  { label: "Confirmado", value: "confirmed" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregue", value: "delivered" },
  { label: "Cancelado", value: "cancelled" },
  { label: "Devolvido", value: "returned" },
];

const optionsPriority: { label: string; value: TypePriorityOrder }[] = [
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" },
  { label: "Urgente", value: "urgent" },
  { label: "Crítica", value: "critical" },
];

export interface IColumnKanban {
  id: number;
  name: string;
  sequence: number;
  color: string;
  rows: {
    id: number;
    sequence: number;
    content: { protocol: string };
  }[];
}

export interface IDataKanban {
  id: number;
  columns: IColumnKanban[];
}

interface PropsFilter {
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
}

const TabOrders_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const { socket, ns } = useContext(SocketContext);
  const { dialog: DialogModal } = useDialogModal({});
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const { logout, account } = useContext(AuthContext);
  const [filter, setFilter] = useState<PropsFilter>({});
  const [load, setLoad] = useState(false);
  const [kanban, setKanban] = useState<IDataKanban>({
    id: 1,
    columns: [
      {
        color: "#000",
        id: 1,
        name: "Coluna 1",
        rows: [{ content: { protocol: "00001" }, id: 1, sequence: 1 }],
        sequence: 1,
      },
      {
        color: "#8b3232",
        id: 2,
        name: "Coluna 2",
        rows: [{ content: { protocol: "00001" }, id: 2, sequence: 1 }],
        sequence: 2,
      },
    ],
  } as IDataKanban);
  const [loadMoveTicket, setLoadMoveTicket] = useState<number | null>(null);

  async function get(props: PropsFilter) {
    try {
      setLoad(true);
      const { orders: oL } = await getOrders({
        limit: 15,
        ...props,
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
          order: OrderRow;
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
                setOrders((orders) => [...orders, props.order]);
              }
            } else {
              setOrders((orders) =>
                orders.map((order) => {
                  if (order.id === props.order.id) {
                    return { ...order, ...props.order };
                  }
                  return order;
                })
              );
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
    const start = kanban.columns.find(
      (cl) => cl.id === Number(source.droppableId)
    );
    const finish = kanban.columns.find(
      (c) => c.id === Number(destination.droppableId)
    );
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
    <div className="flex-1 !pt-0 grid grid-cols-[210px_1fr] gap-x-2 h-full">
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
            <div className="remove-scroll overflow-x-auto pr-5 pl-4 pb-4 h-full flex space-x-3">
              {kanban?.columns?.map((column) => {
                return (
                  <Column
                    loadMoveTicket={loadMoveTicket}
                    key={column.id}
                    column={{
                      id: String(column.id),
                      name: column.name,
                      color: column.color,
                    }}
                    rows={column.rows}
                  />
                );
              })}
            </div>
          </DragDropContext>
        </>
      )}
      {DialogModal}
    </div>
  );
};

export interface ITaskProps {
  id: number;
  sequence: number;
  content: { protocol: string };
}

interface ColumnProps {
  column: { id: string; name: string; color: string };
  rows: ITaskProps[];
  loadMoveTicket: number | null;
}

const Column: FC<ColumnProps> = ({ column, rows, loadMoveTicket }) => {
  const [searchValue, setSearchValue] = useState("");

  const labelAmount = useMemo(() => {
    if (rows.length > 1) return rows.length + " tickets";
    return rows.length + " ticket";
  }, [rows.length]);

  return (
    <Grid
      border={"1px solid #3F3F50"}
      rounded={"10px"}
      h={"100%"}
      minW={"270px"}
      w={"270px"}
      templateRows={"91px 1fr"}
    >
      <VStack
        borderRadius={"10px 10px 0 0"}
        bg={`linear-gradient(0deg, rgba(0,172,255,0) 20%, ${column.color}72 110%)`}
        gap={"7px"}
        p="13px 11px"
        borderBottom={"1px solid #3F3F50"}
      >
        <HStack w={"100%"} justifyContent={"space-between"}>
          <Text
            color={fontColorContrast(column.color + "72")}
            fontSize={"13px"}
            fontWeight={"bold"}
          >
            {column.name}
          </Text>
          <Circle p={"1px"} px={"13px"} fontSize={"12px"} bg={"#12121780"}>
            {labelAmount}
          </Circle>
        </HStack>
      </VStack>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`p-2 pr-0 duration-200 flex-1 h-full ${
              snapshot.isDraggingOver ? "bg-gray-500/5" : ""
            }`}
            style={{ height: "calc(100svh - 191px)" }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div
              className={`respon-column scroll-custom overflow-y-scroll flex-1 h-full`}
            >
              {rows.map((row, index) => (
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
  ITaskProps & { index: number; loadMoveTicket: number | null }
> = ({ id, index, ...props }) => {
  // const { user } = useContext(AuthorizationContext);
  // const previewDateLastMsg = useMemo(() => {
  //   if (props.content.lastMsg) {
  //     const days = moment().diff(props.content.lastMsg.date, "day");
  //     console.log(days);
  //     if (days === 0) {
  //       return moment(props.content.lastMsg.date).format("HH:mm");
  //     }
  //     if (days === 1) return "Ontem";
  //     if (days >= 2 || days <= 7) {
  //       return diasDaSemana[moment(props.content.lastMsg.date).day()];
  //     } else {
  //       return moment(props.content.lastMsg.date).format("DD/MM/YYYY");
  //     }
  //   } else {
  //     return null;
  //   }
  // }, [props.content.lastMsg]);

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
            bg={snapshot.isDragging ? "#30303d" : "#202029"}
            borderRadius={"8px"}
            transitionDuration={"300ms"}
            padding={"10px 12px"}
            alignItems={"start"}
            borderLeftRadius={0}
          >
            <span>{props.content.protocol}</span>
          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

function OrderItem(props: OrderRow): JSX.Element {
  const [actionsLoad, setActionsLoad] = useState<string[]>([]);
  const { logout } = useContext(AuthContext);

  const run = useCallback(
    async (action: string) => {
      if (actionsLoad.includes(action)) return;
      try {
        setActionsLoad([...actionsLoad, action]);
        await runActionOrder(props.id, action);
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

  const hasShadow: boolean = useMemo(() => {
    return props.data ? props.data?.split("\n").length > 5 : false;
  }, [props.data]);

  return (
    <div className="p-1 pb-1.5 transition-opacity duration-200 group-hover:opacity-40 hover:!opacity-90">
      <article className="text-sm cursor-pointer relative leading-4 py-5 pb-3 bg-[#f0de9e] text-black">
        <div className="flex justify-between px-2 mb-1 items-center">
          <div className="flex items-center flex-wrap gap-x-1">
            <span className="line-clamp-1 text-nowrap font-medium">
              {optionsStatus.find((s) => s.value === props.status)?.label}
            </span>
          </div>
        </div>
        <div className="flex px-2 mb-1 items-center gap-x-1">
          <span className="font-semibold text-base">#{props.n_order}</span>
          <span className="text-black/70">
            {moment(props.createAt).format("HH:mm DD/M/YYYY")}
          </span>
        </div>
        {props.name && (
          <div className="flex px-2 items-center justify-between gap-x-1">
            <span>Nome</span>
            <span className="line-clamp-1 text-nowrap">{props.name}</span>
          </div>
        )}
        {props.payment_method && (
          <div className="flex px-2 items-center justify-between gap-x-1">
            <span>Método</span>
            <span>{props.payment_method}</span>
          </div>
        )}
        {props.delivery_address && (
          <div className="flex flex-col px-2">
            <span>Endereço de entrega</span>
            <span>- {props.delivery_address || "RETIRAR NO LOCAL"}</span>
          </div>
        )}
        <div className="flex px-2">
          <span className="text-end block w-full">5571986751101</span>
        </div>
        {props.data ? (
          <>
            <Tooltip
              contentProps={{
                css: {
                  "--tooltip-bg": "#fff",
                },
              }}
              closeOnClick={false}
              positioning={{ placement: "top", offset: { mainAxis: -30 } }}
              closeOnScroll={false}
              showArrow
              content={
                <div className="flex flex-col">
                  <span className="font-semibold text-base block mb-1">
                    #{props.n_order}
                  </span>
                  <span>{parse(format(props.data))}</span>
                </div>
              }
            >
              <div className="relative bg-[#f5e5ae] duration-200">
                <div className="border-b-2 my-2 border-dashed border-zinc-800/70" />
                <span className="px-2 line-clamp-5">
                  {parse(format(props.data))}
                </span>
                {hasShadow && (
                  <div
                    className="absolute bottom-0 w-full h-10"
                    style={{
                      background:
                        "linear-gradient(transparent 0%, #ddcc90 90%)",
                    }}
                  />
                )}
              </div>
            </Tooltip>
            <div className="border-b-2 mb-2 border-dashed border-zinc-800/70" />
          </>
        ) : (
          <div className="border-b-2 my-2 border-dashed border-zinc-800/70" />
        )}
        {/* {props.total && (
          <div className="flex px-2 items-center justify-between gap-x-1">
            <span>Total</span>
            <span>{formatToBRL(props.total)}</span>
          </div>
        )} */}
        {/* <div className="flex px-2 items-center justify-between gap-x-1">
          <span>Descontos</span>
          <span>- 0,00</span>
        </div> */}
        {props.total && (
          <div className="flex px-2 font-bold items-center justify-between gap-x-1">
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
        <img src="/note.svg" alt="" className="absolute -bottom-1" />
      </article>
    </div>
  );
}

export const TabOrders = memo(TabOrders_);
