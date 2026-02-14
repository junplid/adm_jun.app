import { JSX, useCallback, useContext, useEffect, useMemo } from "react";
import {
  Column,
  TableComponent,
  TableMobileComponent,
} from "@components/Table";
import moment from "moment";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { ModalCreateAgentAI } from "./modals/create";
import { Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useGetAgentsAI } from "../../../hooks/agentAI";
import { ModalDeleteAgentAI } from "./modals/delete";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlineSync,
  MdSignalWifiConnectedNoInternet0,
} from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { ModalEditAgentAI } from "./modals/edit";
// import { FaCrown } from "react-icons/fa";
// import { Tooltip } from "@components/ui/tooltip";
import { AuthContext } from "@contexts/auth.context";
// import { LayoutWorkbenchPageContext } from "../contexts";
import { TbPlugConnected } from "react-icons/tb";
import { AiOutlinePoweroff } from "react-icons/ai";
import { ModalConnectConnectionWA } from "../../connectionswa/modals/connect";
import { SocketContext } from "@contexts/socket.context";
import { useDisconnectConnectionWA } from "../../../hooks/connectionWA";
import { queryClient } from "../../../main";
import { ImConnection } from "react-icons/im";
import { motion } from "framer-motion";

export interface AgentsAIRow {
  businesses: { id: number; name: string }[];
  id: number;
  name: string;
  createAt: Date;
  status: "open" | "close";
  connectionWAId: number;
}

const MotionIcon = motion.create(MdOutlineSync);

export const AgentsAIPage: React.FC = (): JSX.Element => {
  // const { ToggleMenu } = useContext(LayoutWorkbenchPageContext);
  const { clientMeta } = useContext(AuthContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});
  const { data: agentsAI, isFetching, isPending } = useGetAgentsAI();

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
        key: "name",
        name: "Nome",
        render(row) {
          return (
            <div className="flex items-start flex-col">
              <span>{row.name}</span>
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
            </div>
          );
        },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 135 },
        render(row) {
          return (
            <div className="flex flex-col">
              <span>{moment(row.createAt).format("D/M/YY")}</span>
              <span className="text-xs text-white/50">
                {moment(row.createAt).format("HH:mm")}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center gap-x-1.5">
              {row.status === "close" && (
                <Button
                  onClick={() =>
                    onOpen({
                      size: "lg",
                      content: (
                        <ModalConnectConnectionWA
                          name={`Conectar "${row.name}" ao WhatsApp`}
                          close={close}
                          id={row.connectionWAId}
                        />
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
                  onClick={() => disconnectWhatsapp(row.connectionWAId)}
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
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#60c4eb63" }}
                disabled
              >
                <LuEye size={18} color={"#92f2ff"} />
              </Button>
              <Button
                onClick={() => {
                  onOpen({
                    size: "xl",
                    content: <ModalEditAgentAI close={close} id={row.id} />,
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
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteAgentAI
                        data={{ id: row.id, name: row.name }}
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
      "status-connection",
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
      socket.off("status-connection");
    };
  }, []);

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5 px-2">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex flex-col gap-y-0.5">
            <div className="flex items-center gap-x-2">
              <h1 className="text-lg font-semibold flex items-center gap-x-2">
                {/* {!isPremium && (
                <Tooltip
                  content="Disponível apenas para usuários Premium."
                  positioning={{ placement: "right" }}
                  contentProps={{
                    color: "#e2a011",
                    background: "#2e2c2c",
                    fontSize: "14px",
                  }}
                >
                  <Badge bg={"#cac0393c"} color={"#ffc444"} p={"7px"}>
                    <FaCrown size={20} />
                  </Badge>
                </Tooltip>
              )} */}
                Assistentes de IA
              </h1>

              <Button
                onClick={() => {
                  onOpen({
                    size: "xl",
                    content: <ModalCreateAgentAI close={close} />,
                  });
                }}
                variant="outline"
                size={"sm"}
              >
                <IoAdd /> Adicionar
              </Button>
            </div>
            <p className="text-white/60 font-light">
              Autônomos que usam IA para realizar tarefas e alcançar objetivos.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 grid px-2 mt-1">
        {clientMeta.isMobileLike ? (
          <TableMobileComponent
            totalCount={agentsAI?.length || 0}
            renderItem={(index) => {
              const row = agentsAI![index];
              return (
                <div className="flex flex-col bg-amber-50/5 p-3! py-2! rounded-md">
                  <div className="flex items-center justify-between gap-x-1">
                    <span className="text-sm truncate font-semibold">
                      {row.name}
                    </span>
                    <div className="flex w-[185px] items-center justify-end text-xs gap-x-1">
                      <span className="text-white/50">Data de criação:</span>
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
                      {row.connectionWAId && row.status === "close" && (
                        <Button
                          onClick={() =>
                            onOpen({
                              size: "lg",
                              content: (
                                <ModalConnectConnectionWA
                                  name={`Conectar "${row.name}" ao WhatsApp`}
                                  close={close}
                                  id={row.connectionWAId!}
                                />
                              ),
                            })
                          }
                          size={"xs"}
                          bg={"#def5cf18"}
                          color={"#9cc989"}
                          _hover={{ bg: "#def5cf2b" }}
                          _icon={{ width: "16px", height: "16px" }}
                          disabled
                        >
                          <TbPlugConnected />
                        </Button>
                      )}
                      {row.connectionWAId &&
                        (row.status === "open" || row.status === "sync") && (
                          <Button
                            onClick={() =>
                              disconnectWhatsapp(row.connectionWAId!)
                            }
                            size={"xs"}
                            bg={"#ddafaf14"}
                            disabled={row.status === "sync"}
                            color={"#d77474"}
                            _hover={{ bg: "#f5cfcf2b" }}
                            _icon={{ width: "16px", height: "16px" }}
                          >
                            <AiOutlinePoweroff />
                          </Button>
                        )}
                      <Button
                        size={"xs"}
                        bg={"#30c9e414"}
                        _hover={{ bg: "#30c9e422" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() => {
                          onOpen({
                            content: (
                              <ModalEditAgentAI close={close} id={row.id} />
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
                              <ModalDeleteAgentAI
                                data={{ id: row.id, name: row.name }}
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
        ) : (
          <TableComponent
            rows={agentsAI || []}
            columns={renderColumns}
            textEmpity="Seus assistentes de IA aparecerão aqui."
            load={isFetching || isPending}
          />
        )}
      </div>
      {DialogModal}
    </div>
  );
};
