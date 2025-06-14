import { JSX, useMemo } from "react";
import moment from "moment";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateBusiness } from "./modals/create";
import { ModalDeleteBusiness } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewBusiness } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditBusiness } from "./modals/edit";
import { useGetBusinesses } from "../../hooks/business";
import { useDialogModal } from "../../hooks/dialog.modal";

export interface BusinessRow {
  id: number;
  name: string;
  createAt: Date;
}

export const BusinessesPage: React.FC = (): JSX.Element => {
  const { data: businesses, isFetching, isPending } = useGetBusinesses();

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
        name: "Nome",
        styles: { width: 800 },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 170 },
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
                onClick={() =>
                  onOpen({
                    content: <ModalViewBusiness close={close} id={row.id} />,
                  })
                }
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
                    content: <ModalEditBusiness close={close} id={row.id} />,
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
                      <ModalDeleteBusiness
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
          <h1 className="text-lg font-semibold">Projetos</h1>
          <ModalCreateBusiness
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Workspaces para organizar e gerenciar suas operações de forma
          eficiente.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="grid flex-1">
        <TableComponent
          rows={businesses || []}
          columns={renderColumns}
          textEmpity="Seus projetos aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
