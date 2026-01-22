import { JSX, useCallback, useContext, useEffect, useMemo } from "react";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateChatbot } from "./modals/create";
import { ModalDeleteChatbot } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlineSync,
  MdSignalWifiConnectedNoInternet0,
} from "react-icons/md";
import { ModalViewChatbot } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditChatbot } from "./modals/edit";
import { useDialogModal } from "../../hooks/dialog.modal";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import { useGetChatbots } from "../../hooks/chatbot";
import { AuthContext } from "@contexts/auth.context";
import { ImConnection } from "react-icons/im";
import { ModalConnectConnectionWA } from "../connectionswa/modals/connect";
import { TbPlugConnected } from "react-icons/tb";
import { AiOutlinePoweroff } from "react-icons/ai";
import { useDisconnectConnectionWA } from "../../hooks/connectionWA";
import { SocketContext } from "@contexts/socket.context";
import { queryClient } from "../../main";
import { motion } from "framer-motion";
import { BsStars } from "react-icons/bs";

export type TypeConnectionWA = "chatbot" | "marketing";

export interface ChatbotRow {
  business: { name: string; id: number };
  name: string;
  id: number;
  status: boolean;
  createAt: Date;
  connectionWAId?: number;
}

const MotionIcon = motion.create(MdOutlineSync);

// const translateType: {
//   [x in TypeConnectionWA]: { label: string; cb: string; ct: string };
// } = {
//   chatbot: { label: "Recepção bot", cb: "#294d6e", ct: "#dcf4ff" },
//   marketing: { label: "Imutável", cb: "#836e21", ct: "#fff" },
// };

export const ChatbotsPage: React.FC = (): JSX.Element => {
  const { clientMeta } = useContext(AuthContext);
  const { data: chatbots, isFetching, isPending } = useGetChatbots();
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

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "status",
        name: "Status",
        styles: { width: 70 },
        render(row) {
          return (
            <div className="w-full flex items-center justify-center">
              {!row.status && (
                <IoMdRadioButtonOff color={"#f17b7b"} size={20} />
              )}
              {row.status && (
                <IoMdRadioButtonOn color={"#7bf1a8e2"} size={24} />
              )}
            </div>
          );
        },
      },
      {
        key: "name",
        name: "Nome do bot de recepção",
        render(row) {
          return (
            <div className="flex flex-col items-baseline">
              <span>{row.name}</span>
              <div className="flex items-center gap-x-2">
                {row.AgentAI && (
                  <div className="flex items-center gap-x-1 px-1! bg-blue-300/20 text-blue-300">
                    <BsStars />
                    <span>{row.AgentAI.name}</span>
                  </div>
                )}
                {row.connStt === "close" && (
                  <div className="flex text-xs items-center gap-x-1 px-1! bg-red-300/20 text-red-300">
                    <MdSignalWifiConnectedNoInternet0
                      color={"#e96068"}
                      size={18}
                    />
                    <span>Conexão off</span>
                  </div>
                )}
                {row.connStt === "open" && (
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
        key: "actions",
        name: "",
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              {row.connectionWAId !== undefined && row.connStt === "close" && (
                <Button
                  onClick={() =>
                    onOpen({
                      size: "lg",
                      content: (
                        <ModalConnectConnectionWA
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
              {row.connectionWAId !== undefined &&
                (row.connStt === "open" || row.status === "sync") && (
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
                onClick={() =>
                  onOpen({
                    content: <ModalViewChatbot close={close} id={row.id} />,
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
                      <ModalEditChatbot
                        isAgent={!!row.AgentAI}
                        close={close}
                        id={row.id}
                      />
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
                disabled={!!row.AgentAI}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteChatbot
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

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Bots de recepção</h1>
          <ModalCreateChatbot
            trigger={
              <Button
                disabled={clientMeta.isMobileLike}
                variant="outline"
                size={"sm"}
              >
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Atenda seus clientes 24 horas por dia, 7 dias por semana, de forma
          contínua e integrada.
        </p>
      </div>
      {clientMeta.isMobileLike ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-sm px-2">
            Disponível apenas para acesso via desktop. Para utilizá-la, acesse o
            sistema por um computador.
          </span>
        </div>
      ) : (
        <div
          style={{ maxHeight: "calc(100vh - 180px)" }}
          className="flex-1 grid"
        >
          <TableComponent
            rows={chatbots || []}
            columns={renderColumns}
            textEmpity="Seus bots de recepção aparecerão aqui."
            load={isFetching || isPending}
          />
        </div>
      )}

      {DialogModal}
    </div>
  );
};
