import { JSX, useContext, useMemo } from "react";
import moment from "moment";
import { Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { Column, TableComponent } from "@components/Table";
import { LayoutInboxesPageContext } from "../contexts";
import { ModalCreateUser } from "./modals/create";
import { useGetInboxUsers } from "../../../hooks/inboxUser";
import { ModalDeleteInboxUser } from "./modals/delete";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalEditIndexUser } from "./modals/edit";
import { LuEye } from "react-icons/lu";

export interface inboxUserRow {
  id: number;
  name: string;
  createAt: Date;
}

export const InboxUsersPage: React.FC = (): JSX.Element => {
  const { ToggleMenu } = useContext(LayoutInboxesPageContext);
  const { data: inboxUsers, isFetching, isPending } = useGetInboxUsers();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "id",
        name: "ID",
        styles: { width: 10 },
      },
      {
        key: "name",
        name: "Nome do atendente",
      },
      {
        key: "tickets_open",
        name: "Atendendo",
        styles: { width: 100 },
        render(row) {
          return (
            <div className="flex items-center justify-center">
              <span
                className="font-semibold"
                style={{ color: row.tickets_open > 0 ? "#4caf50" : "#f44336" }}
              >
                {row.tickets_open}
              </span>
            </div>
          );
        },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 140 },
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
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled
              >
                <LuEye color={"#dbdbdb"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: <ModalEditIndexUser close={close} id={row.id} />,
                  })
                }
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
                      <ModalDeleteInboxUser
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
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            {ToggleMenu}
            <h1 className="text-lg font-semibold">Atendentes</h1>
            <p className="text-white/60 font-light">
              responsáveis por atender seus contatos.
            </p>
          </div>

          <ModalCreateUser
            trigger={
              <Button disabled variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex-1 grid">
        <TableComponent
          rows={inboxUsers || []}
          columns={renderColumns}
          textEmpity="Seus atendentes aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
