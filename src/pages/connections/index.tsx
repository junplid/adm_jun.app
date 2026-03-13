import { JSX, useCallback, useContext, useEffect, useMemo } from "react";
import { TableComponent, TableMobileComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateConnectionWA } from "./modals/create";
import { ModalDeleteConnectionWA } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlineSync,
  MdSignalWifiConnectedNoInternet0,
} from "react-icons/md";
import { ModalViewConnectionWA } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditConnectionWA } from "./modals/edit";
import { useDialogModal } from "../../hooks/dialog.modal";
import {
  useDisconnectConnectionWA,
  useGetConnectionsWA,
} from "../../hooks/connectionWA";
import { ImConnection } from "react-icons/im";
import { TbPlugConnected } from "react-icons/tb";
import { ModalConnectConnectionWA } from "./modals/connect";
import { SocketContext } from "@contexts/socket.context";
import { useQueryClient } from "@tanstack/react-query";
import { AiOutlinePoweroff } from "react-icons/ai";
import { motion } from "framer-motion";
import { AuthContext } from "@contexts/auth.context";
import { BsStars } from "react-icons/bs";
import { useRoomWebSocket } from "../../hooks/roomWebSocket";
import { FaInstagram } from "react-icons/fa";
import moment from "moment";

export type TypeConnectionWA = "chatbot" | "marketing";

export interface ConnectionWARow {
  business: { name: string; id: number }[];
  type: "ig" | "msg";
  name: string;
  id: number;
  value: string | null;
  status: "open" | "close" | "connecting" | "sync";
}

const MotionIcon = motion.create(MdOutlineSync);

// const translateType: {
//   [x in TypeConnectionWA]: { label: string; cb: string; ct: string };
// } = {
//   chatbot: { label: "Recepção bot", cb: "#294d6e", ct: "#dcf4ff" },
//   marketing: { label: "Imutável", cb: "#836e21", ct: "#fff" },
// };

export const ConnectionsWAPage: React.FC = (): JSX.Element => {
  useRoomWebSocket("connections", undefined);
  const { clientMeta } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { data: connectionsWA, isFetching, isPending } = useGetConnectionsWA();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const { socket } = useContext(SocketContext);

  const { mutateAsync: disconnectWA } = useDisconnectConnectionWA();

  const disconnectWhatsapp = useCallback(async (id: number) => {
    try {
      await disconnectWA({ id });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "status",
        name: "Status",
        styles: { width: 70 },
        render(row) {
          return (
            <div className="w-full flex items-center justify-center">
              {row.status === "sync" && (
                <MotionIcon
                  size={27}
                  color="#7bb4f1"
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "linear",
                  }}
                />
              )}
              {row.status === "close" && (
                <MdSignalWifiConnectedNoInternet0 color={"#f17b7b"} size={28} />
              )}
              {row.status === "open" && (
                <ImConnection color={"#7bf1a8e2"} size={25} />
              )}
            </div>
          );
        },
      },
      {
        key: "name",
        name: "Nome da conexão",
        render(row) {
          return (
            <div className="flex items-start flex-col">
              <span className="flex items-center gap-x-1.5">
                {row.type === "ig" && (
                  <div className="w-4 opacity-70 h-4 flex items-center justify-center bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-sm">
                    <FaInstagram size={clientMeta.isMobileLike ? 25 : 14} />
                  </div>
                )}
                <span>{row.name}</span>
              </span>
              {row.value && (
                <small className="text-white/45">= {row.value}</small>
              )}
              <div className="flex items-center">
                {row.AgentAI && (
                  <div className="flex items-center gap-x-1 px-1! bg-blue-300/20 text-blue-300">
                    <BsStars />
                    <span>{row.AgentAI.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 4 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              {row.status === "close" && (
                <Button
                  onClick={() =>
                    onOpen({
                      size: "lg",
                      content: (
                        <ModalConnectConnectionWA close={close} id={row.id} />
                      ),
                    })
                  }
                  size={"sm"}
                  bg={"transparent"}
                  color={"#9cc989"}
                  _hover={{ bg: "#def5cf2b" }}
                  _icon={{ width: "20px", height: "22px" }}
                >
                  <TbPlugConnected size={30} />
                </Button>
              )}
              {(row.status === "open" || row.status === "sync") && (
                <Button
                  onClick={() => disconnectWhatsapp(row.id)}
                  size={"sm"}
                  bg={"transparent"}
                  disabled={row.status === "sync"}
                  color={"#d77474"}
                  _hover={{ bg: "#f5cfcf2b" }}
                  _icon={{ width: "20px", height: "22px" }}
                >
                  <AiOutlinePoweroff size={30} />
                </Button>
              )}
              <Button
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalViewConnectionWA close={close} id={row.id} />
                    ),
                  })
                }
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
              >
                <LuEye color={"#dbdbdb"} />
              </Button>
              <Button
                onClick={() => {
                  onOpen({
                    size: "sm",
                    content: (
                      <ModalEditConnectionWA close={close} id={row.id} />
                    ),
                  });
                }}
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                // disabled={!!row.AgentAI}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteConnectionWA
                        data={{ id: row.id, name: row.name, type: row.type }}
                        close={close}
                      />
                    ),
                  });
                }}
              >
                <MdDeleteOutline color={"#f75050"} />
              </Button>
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  useEffect(() => {
    socket.on(
      "status_connection",
      (data: {
        connectionId: number;
        connection?:
        | "open"
        | "close"
        | "connecting"
        | "sync"
        | "connectionLost";
      }) => {
        if (data.connection) {
          queryClient.setQueryData(["connections-wa", null], (oldData: any) => {
            if (oldData) {
              return oldData.map((conn: any) => {
                if (conn.id === data.connectionId) {
                  if (data.connection === "connectionLost") {
                    conn = { ...conn, status: "close" };
                  } else if (data.connection === "connecting") {
                    conn = { ...conn, status: "close" };
                  } else {
                    conn = { ...conn, status: data.connection };
                  }
                }
                return conn;
              });
            }
            return oldData;
          });
        }
      },
    );

    return () => {
      socket.off("status_connection");
    };
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Conexões</h1>
          <ModalCreateConnectionWA
            trigger={
              <Button
                variant="outline"
                size={"sm"}
              >
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Cerca de 80% das empresas utilizam o WhatsApp para impulsionar suas
          vendas e estratégias de marketing.
        </p>
      </div>
      {clientMeta.isMobileLike || clientMeta.isSmallScreen ? (
        <div className="h-full flex-1 grid px-2">
          <TableMobileComponent
            totalCount={(connectionsWA || []).length}
            renderItem={(index) => {
              const row = (connectionsWA || [])[index];
              return (
                <div className="flex flex-col my-1 bg-amber-50/5 p-3! py-2! rounded-md">
                  <div className="flex items-center justify-between gap-x-1">
                    <span className="text-sm truncate font-semibold">
                      {row.name}
                    </span>
                    <div className="flex w-46.25 items-center justify-end text-xs gap-x-1">
                      <span>{moment(row.createAt).format("D/M/YY")}</span>
                      <span className="text-white/50 text-[11px]">
                        {moment(row.createAt).format("HH:mm")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-1 justify-between">
                    <div className="flex items-center">
                      {row.status === "close" && (
                        <div className="flex text-xs items-center gap-x-1 px-1! bg-red-300/20 text-red-300">
                          <MdSignalWifiConnectedNoInternet0
                            color={"#e96068"}
                            size={18}
                          />
                          <span>Conexão off</span>
                        </div>
                      )}
                      {row.status === "open" && (
                        <div className="flex text-xs items-center gap-x-1 px-1! bg-green-300/20 text-green-300">
                          <ImConnection color={"#7bf1a8e2"} size={18} />
                          <span>Conexão on</span>
                        </div>
                      )}
                      {row.status === "sync" && (
                        <div className="flex text-xs items-center gap-x-1 px-1! bg-blue-300/20 text-blue-300">
                          <MotionIcon
                            size={18}
                            color="#7bb4f1"
                            animate={{ rotate: -360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              ease: "linear",
                            }}
                          />
                          <span>Conexão sync</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-x-1">
                      {row.status === "close" && (
                        <Button
                          onClick={() =>
                            onOpen({
                              size: "lg",
                              content: (
                                <ModalConnectConnectionWA close={close} id={row.id} />
                              ),
                            })
                          }
                          size={"sm"}
                          bg={"transparent"}
                          color={"#9cc989"}
                          _hover={{ bg: "#def5cf2b" }}
                          _icon={{ width: "20px", height: "22px" }}
                        >
                          <TbPlugConnected size={30} />
                        </Button>
                      )}
                      {(row.status === "open" || row.status === "sync") && (
                        <Button
                          onClick={() => disconnectWhatsapp(row.id)}
                          size={"sm"}
                          bg={"transparen"}
                          disabled={row.status === "sync"}
                          color={"#d77474"}
                          _hover={{ bg: "#f5cfcf2b" }}
                          _icon={{ width: "20px", height: "22px" }}
                        >
                          <AiOutlinePoweroff size={30} />
                        </Button>
                      )}
                      <Button
                        size={"xs"}
                        bg={"#30c9e414"}
                        _hover={{ bg: "#30c9e422" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() => {
                          onOpen({
                            size: "sm",
                            content: (
                              <ModalEditConnectionWA close={close} id={row.id} />
                            ),
                          });
                        }}
                      >
                        <MdEdit color={"#9ec9fa"} />
                      </Button>
                      <Button
                        size={"xs"}
                        bg={"#cf5c5c24"}
                        _hover={{ bg: "#eb606028" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() => {
                          onOpen({
                            content: (
                              <ModalDeleteConnectionWA
                                // @ts-expect-error
                                data={{ id: row.id, name: row.name, type: row.type }}
                                close={close}
                              />
                            ),
                          });
                        }}
                      >
                        <MdDeleteOutline color={"#f75050"} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }}
            textEmpity="Seus assistentes de IA aparecerão aqui."
            load={isFetching || isPending}
          />
        </div>
      ) : (
        <div
          style={{ maxHeight: "calc(100vh - 180px)" }}
          className="flex-1 grid"
        >
          <TableComponent
            rows={connectionsWA || []}
            columns={renderColumns}
            textEmpity="Suas conexões aparecerão aqui."
            load={isFetching || isPending}
          />
        </div>
      )}
      {DialogModal}
    </div>
  );
};
