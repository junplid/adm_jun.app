import { JSX, useMemo } from "react";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateChatbot } from "./modals/create";
import { ModalDeleteConnectionWA } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewConnectionWA } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditConnectionWA } from "./modals/edit";
import { useDialogModal } from "../../hooks/dialog.modal";
import { useGetConnectionsWA } from "../../hooks/connectionWA";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import { useGetChatbots } from "../../hooks/chatbot";

export type TypeConnectionWA = "chatbot" | "marketing";

export interface ConnectionWARow {
  business: { name: string; id: number }[];
  type: TypeConnectionWA;
  name: string;
  id: number;
  value: string | null;
  status: "open" | "close" | "connecting" | "sync";
}

// const translateType: {
//   [x in TypeConnectionWA]: { label: string; cb: string; ct: string };
// } = {
//   chatbot: { label: "Recepção bot", cb: "#294d6e", ct: "#dcf4ff" },
//   marketing: { label: "Imutável", cb: "#836e21", ct: "#fff" },
// };

export const ChatbotsPage: React.FC = (): JSX.Element => {
  const { data: chatbots, isFetching, isPending } = useGetChatbots();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

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
            <div className="flex items-start flex-col">
              <span>{row.name}</span>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalViewConnectionWA close={close} id={row.id} />
                    ),
                  })
                }
                size={"sm"}
                bg={"#f0f0f016"}
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
                bg={"#60d6eb13"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"#eb606013"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
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

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Bots de recepção</h1>
          <ModalCreateChatbot
            trigger={
              <Button variant="outline" size={"sm"}>
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
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="flex-1 grid">
        <TableComponent
          rows={chatbots || []}
          columns={renderColumns}
          textEmpity="Nenhum bot de recepção criado."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
