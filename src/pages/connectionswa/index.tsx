import { JSX, useCallback, useContext, useEffect, useMemo } from "react";
import { TableComponent } from "../../components/Table";
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

export type TypeConnectionWA = "chatbot" | "marketing";

export interface ConnectionWARow {
  business: { name: string; id: number }[];
  type: TypeConnectionWA;
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
              <span>{row.name}</span>
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
                disabled={!!row.AgentAI}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteConnectionWA
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
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Conexões WA</h1>
          <ModalCreateConnectionWA
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
          Cerca de 80% das empresas utilizam o WhatsApp para impulsionar suas
          vendas e estratégias de marketing.
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
            rows={connectionsWA || []}
            columns={renderColumns}
            textEmpity="Suas conexões WA aparecerão aqui."
            load={isFetching || isPending}
          />
        </div>
      )}
      {DialogModal}
    </div>
  );
};
