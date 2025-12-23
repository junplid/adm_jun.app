import { JSX, useContext, useMemo } from "react";
import moment from "moment";
import { TableComponent } from "../../../components/Table";
import { Column } from "../../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteFlow } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewFlow } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditFlow } from "./modals/edit";
import { FlowType } from "../../../services/api/Flow";
import { useGetFlows } from "../../../hooks/flow";
import { Link } from "react-router-dom";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { LayoutWorkbenchPageContext } from "../contexts";
import { TbFileDownload, TbFileUpload } from "react-icons/tb";

export interface FlowRow {
  id: string;
  name: string;
  createAt: Date;
  updateAt: Date;
  type: FlowType;
  businesses: { id: number; name: string }[];
}

export const FlowsPage: React.FC = (): JSX.Element => {
  const { ToggleMenu } = useContext(LayoutWorkbenchPageContext);
  const { data: flows, isFetching, isPending } = useGetFlows();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome do fluxo",
        render(row) {
          return (
            <Link
              to={`/auth/flows/${row.id}`}
              className="text-blue-300 hover:text-blue-400 underline"
            >
              {row.name}
            </Link>
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
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: <ModalViewFlow id={row.id} />,
                  })
                }
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
                    content: <ModalEditFlow close={close} id={row.id} />,
                  })
                }
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#aaeb6028" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() => {
                  // fazer o download do arquivo
                }}
                disabled
              >
                <TbFileDownload color={"#71ce46ff"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteFlow
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
            <h1 className="text-lg font-semibold">Construtor de fluxos</h1>
            <p className="text-white/60 font-light">
              avançado para conversas no WhatsApp
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size={"sm"}
              borderColor={"#2e3a29ff"}
              color="#aeeb92ff"
            >
              <TbFileUpload color="#8ee266ff" /> Importar
            </Button>
            <ModalCreateFlow
              trigger={
                <Button variant="outline" size={"sm"}>
                  <IoAdd /> Adicionar
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <div className="grid flex-1">
        <TableComponent
          rows={flows || []}
          columns={renderColumns}
          textEmpity="Seus construtores de fluxo aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
