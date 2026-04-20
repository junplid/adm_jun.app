import { Spinner } from "@chakra-ui/react";
import { JSX } from "@emotion/react/jsx-runtime";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDialogModal } from "../../hooks/dialog.modal";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { ModalCreateTable } from "./modals/create";
import { getTables, TableStatus } from "../../services/api/Tables";
import { FiPlus } from "react-icons/fi";
import { ModalViewTable } from "./modals/view";
import { formatToBRL } from "brazilian-values";

export interface TableItem {
  price: number | undefined;
  title: string;
  obs: string | null;
  side_dishes: string | null;
  ItemOfOrderId: number;
}

export interface Table {
  order: {
    items: TableItem[];
    adjustments: {
      amount: number;
      type: "in" | "out";
      label: string;
    }[];
  } | null;
  name: string;
  id: number;
  status: TableStatus;
  createAt: Date;
}

function AddMesaCard({
  setTables,
}: {
  setTables: Dispatch<SetStateAction<Table[]>>;
}) {
  return (
    <ModalCreateTable
      onCreate={(table) => setTables((state) => [...state, table])}
      trigger={
        <div className="rounded-md border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800/60 transition">
          <FiPlus size={24} className="text-white" />
          <span className="text-lg text-center font-semibold uppercase">
            Nova Mesa
          </span>
        </div>
      }
    />
  );
}

function MesaCard({ onClick, ...table }: { onClick: () => void } & Table) {
  if (table.status === "OCCUPIED") {
    return (
      <div
        onClick={onClick}
        className={
          "bg-blue-300 rounded-md flex-1 justify-center p-2 flex flex-col cursor-pointer"
        }
      >
        <span className="text-sm font-medium text-blue-700 line-clamp-2 text-center">
          Mesa: {table.name}
        </span>

        <span className="text-xl text-center font-extrabold text-blue-700">
          {formatToBRL(
            table.order?.items.reduce(
              (ac, cr) =>
                ac +
                (cr.price || 0) * Number(cr.title.replace(/^(\d*)x.*/, "$1")),
              0,
            ) || 0,
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={
        "bg-neutral-800/60 rounded-md flex-1 justify-center p-2 flex flex-col cursor-pointer"
      }
    >
      <span className="text-sm inline text-center font-medium">
        <span className="text-xs font-normal text-neutral-400">Mesa</span>{" "}
        {table.name}
      </span>
      <span className="text-lg text-center font-semibold uppercase">Livre</span>
    </div>
  );
}

export const TablesPage: React.FC = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});
  const [tables, setTables] = useState<Table[]>([]);
  const [load, setLoad] = useState(true);
  const [menuUuid, setMenuUuid] = useState<string>("");

  async function get() {
    try {
      const data = await getTables({});
      setTables(data.tables);
      setMenuUuid(data.menuUuid);
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

  // useRoomWebSocket("orders", undefined);

  // useEffect(() => {
  //   socket.on("new_order", (order: Order) => {
  //     setOrders((state) => {
  //       const stateClone = structuredClone(state);
  //       stateClone[order.status].push(order);
  //       return stateClone;
  //     });
  //   });

  //   socket.on("update_order", (order: Order) => {
  //     setOrders((state) => {
  //       const stateClone = structuredClone(state);

  //       const nextListStatus = Object.fromEntries(
  //         Object.entries(stateClone).map(([status, ordersList]) => {
  //           return [
  //             status,
  //             ordersList.map((or) => {
  //               if (order.id === or.id) or = { ...or, ...order };
  //               return or;
  //             }),
  //           ];
  //         }),
  //       );

  //       return nextListStatus;
  //     });
  //   });

  //   socket.on("delete_order", (order: Pick<Order, "id" | "status">) => {
  //     setOrders((state) => {
  //       const stateClone = structuredClone(state);
  //       const nextListStatus = Object.fromEntries(
  //         Object.entries(stateClone).map(([status, ordersList]) => {
  //           return [status, ordersList.filter((or) => or.id !== order.id)];
  //         }),
  //       );
  //       return nextListStatus;
  //     });
  //   });

  //   socket.on(
  //     "remove_ticket",
  //     async (props: {
  //       orderId: number;
  //       ticketId: number;
  //       status: TypeStatusOrder;
  //     }) => {
  //       await new Promise((s) => setTimeout(s, 400));
  //       setOrders((state) => {
  //         const stateClone = structuredClone(state);
  //         stateClone[props.status].map((order) => {
  //           if (order.id === props.orderId) {
  //             const nextTk = order.ticket.filter(
  //               (s) => s.id !== props.ticketId,
  //             );
  //             order.ticket = nextTk;
  //           }
  //           return order;
  //         });
  //         return stateClone;
  //       });
  //     },
  //   );

  //   return () => {
  //     socket.off("new_order");
  //     socket.off("update_status");
  //     socket.off("update_rank");
  //     socket.off("delete_order");
  //   };
  // }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col px-2">
      <div className="flex flex-col sm:pl-0 pl-2">
        <div className="flex items-center gap-x-2">
          <h1 className="text-base sm:text-lg font-semibold">
            Controle de mesas
          </h1>
        </div>
      </div>
      <div className="flex-1 pt-0! grid gap-x-2 h-full">
        {load ? (
          <div className="bg-white/5 sm:m-0 m-2 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <div className="h-[calc(100svh-130px)] sm:h-[calc(100svh-165px)] md:h-[calc(100svh-110px)] grid gap-2 grid-cols-[repeat(auto-fill,minmax(130px,1fr))] auto-rows-[90px] overflow-y-auto pb-4">
            {tables.map((table) => (
              <MesaCard
                onClick={() => {
                  onOpen({
                    size: "full",
                    content: (
                      <ModalViewTable
                        onDeleteTable={(tableId) => {
                          setTables((stateTables) =>
                            stateTables.filter(
                              (stable) => stable.id !== tableId,
                            ),
                          );
                        }}
                        onCloseTable={(tableId) => {
                          setTables((stateTables) =>
                            stateTables.map((stable) => {
                              if (stable.id !== tableId) return stable;

                              return {
                                ...stable,
                                status: "AVAILABLE",
                                order: {
                                  ...stable.order,
                                  items: [],
                                  adjustments: [],
                                },
                              };
                            }),
                          );
                        }}
                        onDeleteItem={(tableId, ItemOfOrderId) => {
                          setTables((stateTables) =>
                            stateTables.map((stable) => {
                              if (stable.id !== tableId || !stable.order) {
                                return stable;
                              }
                              return {
                                ...stable,
                                order: {
                                  ...stable.order,
                                  items: [
                                    ...stable.order.items.filter(
                                      (d) => d.ItemOfOrderId !== ItemOfOrderId,
                                    ),
                                  ],
                                },
                              };
                            }),
                          );
                        }}
                        onCreateNewsItems={(newItems, adjustments, tableId) => {
                          setTables((stateTables) =>
                            stateTables.map((stable) => {
                              if (stable.id !== tableId) return stable;
                              if (!stable.order) {
                                return {
                                  ...stable,
                                  status: "OCCUPIED" as TableStatus,
                                  order: { items: newItems, adjustments },
                                };
                              }

                              return {
                                ...stable,
                                order: {
                                  ...stable.order,
                                  items: [...stable.order.items, ...newItems],
                                },
                              };
                            }),
                          );
                        }}
                        isDelete={false}
                        close={close}
                        data={table}
                        menuUuid={menuUuid}
                      />
                    ),
                  });
                }}
                key={table.id}
                {...table}
              />
            ))}

            <AddMesaCard setTables={setTables} />
          </div>
        )}
      </div>
      {DialogModal}
    </div>
  );
};
