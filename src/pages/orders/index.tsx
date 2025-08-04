import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ModalCreateBusiness } from "./modals/create";
import { Button, Spinner } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../hooks/dialog.modal";
import SelectComponent from "@components/Select";
import { Field } from "@components/ui/field";
import {
  // getOrders,
  runActionOrder,
  TypePriorityOrder,
  TypeStatusOrder,
} from "../../services/api/Orders";
import { AuthContext } from "@contexts/auth.context";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { VirtuosoGrid } from "react-virtuoso";
import { SocketContext } from "@contexts/socket.context";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import moment from "moment";
import { Tooltip } from "@components/ui/tooltip";

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

interface PropsFilter {
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
}

export const OrdersPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { dialog: DialogModal } = useDialogModal({});
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const { logout, account } = useContext(AuthContext);
  const [filter, setFilter] = useState<PropsFilter>({});
  const [load, setLoad] = useState(false);

  async function get(_props: PropsFilter) {
    try {
      setLoad(true);
      // const { orders: oL } = await getOrders({ limit: 15, ...props });
      // setOrders(oL);
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

  useEffect(() => {
    if (socket) {
      socket.on(
        "order",
        (props: {
          accountId: number;
          action: "new" | "update";
          order: OrderRow;
        }) => {
          if (props.accountId === account.id) {
            if (props.action === "new") {
              setOrders((orders) => [...orders, props.order]);
            } else {
              console.log(props.order);
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
  }, [socket]);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">
            Pedidos {"(Em desenvolvimento)"}
          </h1>
          <ModalCreateBusiness
            trigger={
              <Button disabled variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Centralize todos os seus pedidos em um único lugar.
        </p>
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-x-2 h-full">
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
      </div>
      {DialogModal}
    </div>
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
          <span className="font-semibold">
            {optionsPriority.find((s) => s.value === props.priority)?.label}
          </span>
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
        {props.total && (
          <div className="flex px-2 items-center justify-between gap-x-1">
            <span>Total</span>
            <span>{props.total}</span>
          </div>
        )}
        {/* <div className="flex px-2 items-center justify-between gap-x-1">
          <span>Descontos</span>
          <span>- 0,00</span>
        </div> */}
        {props.total && (
          <div className="flex px-2 font-bold items-center justify-between gap-x-1">
            <span>Sub total</span>
            <span>{props.total}</span>
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
