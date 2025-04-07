import { JSX, useMemo } from "react";
import moment from "moment";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteFlow } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewFlow } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditFlow } from "./modals/edit";
import { FlowType } from "../../services/api/Flow";
import { useGetFlows } from "../../hooks/flow";
import { Link } from "react-router-dom";

export interface FlowRow {
  id: number;
  name: string;
  createAt: Date;
  updateAt: Date;
  type: FlowType;
  businesses: { id: number; name: string }[];
}

export const FlowsPage: React.FC = (): JSX.Element => {
  const { data: flows, isFetching, isPending } = useGetFlows();

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
        styles: { width: 200 },
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
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <ModalViewFlow
                id={row.id}
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#f0f0f016"}
                    _hover={{ bg: "#ffffff21" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <LuEye color={"#dbdbdb"} />
                  </Button>
                }
              />
              <ModalEditFlow
                id={row.id}
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#60d6eb13"}
                    _hover={{ bg: "#30c9e422" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <MdEdit size={18} color={"#9ec9fa"} />
                  </Button>
                }
              />
              <ModalDeleteFlow
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#eb606013"}
                    _hover={{ bg: "#eb606028" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <MdDeleteOutline color={"#f75050"} />
                  </Button>
                }
                data={{ id: row.id, name: row.name }}
              />
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
          <h1 className="text-lg font-semibold">Construtores de fluxos</h1>
          <ModalCreateFlow
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Construa, melhore e organize fluxos de conversa de forma visual e
          intuitiva.
        </p>
      </div>
      <div
        style={{ maxHeight: "calc(100vh - 180px)" }}
        className="flex flex-col"
      >
        <TableComponent
          rows={flows || []}
          columns={renderColumns}
          textEmpity="Nenhum construtor de fluxo criado."
          load={isFetching || isPending}
        />
      </div>
    </div>
  );
};
