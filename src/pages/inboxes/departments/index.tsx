import { JSX, useContext, useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { Column, TableComponent } from "@components/Table";
import { LayoutInboxesPageContext } from "../contexts";
import { useGetInboxDepartments } from "../../../hooks/inboxDepartment";
import { LuFullscreen } from "react-icons/lu";
import { ModalDeleteInboxDepartment } from "./modals/delete";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalCreateInboxDepartment } from "./modals/create";
import { ModalEditInboxDepartment } from "./modals/edit";
import { ModalPlayerInboxDepartment } from "./modals/Player";

export interface inboxDepartmentRow {
  tickets_open: number;
  business: { id: number; name: string };
  id: number;
  name: string;
  createAt: Date;
}

export const InboxDepartmentsPage: React.FC = (): JSX.Element => {
  const { ToggleMenu } = useContext(LayoutInboxesPageContext);
  const {
    data: inboxDepartments,
    isFetching,
    isPending,
  } = useGetInboxDepartments();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome",
      },
      {
        key: "tickets",
        name: "",
        styles: { width: 120 },
        render(row) {
          return (
            <div className="flex flex-col gap-y-px">
              <div className="flex w-full gap-x-4">
                <span
                  className="font-semibold"
                  style={{
                    color: row.tickets_new ? "#f7a85e" : "#882f29",
                  }}
                >
                  {row.tickets_new}
                </span>
                <span
                  style={{
                    color: row.tickets_new ? "#f7f7f7" : "#6d6d6d",
                  }}
                >
                  Aguardando
                </span>
              </div>
              <div className="flex w-full gap-x-4">
                <span
                  className="font-semibold"
                  style={{
                    color: row.tickets_open ? "#6faddd" : "#882f29",
                  }}
                >
                  {row.tickets_open}
                </span>
                <span
                  style={{
                    color: row.tickets_open ? "#f7f7f7" : "#6d6d6d",
                  }}
                >
                  Atendendo
                </span>
              </div>
            </div>
          );
        },
      },
      // {
      //   key: "createAt",
      //   name: "Data de criação",
      //   styles: { width: 135 },
      //   render(row) {
      //     return (
      //       <div className="flex flex-col">
      //         <span>{moment(row.createAt).format("D/M/YY")}</span>
      //         <span className="text-xs text-white/50">
      //           {moment(row.createAt).format("HH:mm")}
      //         </span>
      //       </div>
      //     );
      //   },
      // },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 4 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#aef8be20" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    size: "xl",
                    content: (
                      <ModalPlayerInboxDepartment
                        close={close}
                        data={{
                          id: row.id,
                          name: row.name,
                          businessId: row.business.id,
                        }}
                      />
                    ),
                  })
                }
              >
                <LuFullscreen color={"#6eb173"} />
              </Button>
              {/* <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled
              >
                <LuEye color={"#dbdbdb"} />
              </Button> */}
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalEditInboxDepartment close={close} id={row.id} />
                    ),
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
                      <ModalDeleteInboxDepartment
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
            <span className="hidden sm:flex">{ToggleMenu}</span>
            <h1 className="text-base sm:text-lg font-semibold">
              Departamentos
            </h1>
            {/* <p className="text-white/60 font-light">
              para organizar melhor seus atendimentos.
            </p> */}
          </div>
          <ModalCreateInboxDepartment
            trigger={
              <Button variant="outline" size={{ sm: "sm", base: "xs" }}>
                <IoAdd /> <span className="sm:block hidden">Adicionar</span>
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex-1 grid">
        <TableComponent
          rows={inboxDepartments || []}
          columns={renderColumns}
          textEmpity="Seus departamentos aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
