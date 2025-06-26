import { JSX, useContext, useMemo } from "react";
import { Column, TableComponent } from "../../components/Table";
import moment from "moment";
import { useDialogModal } from "../../hooks/dialog.modal";
import { ModalCreateAgentAI } from "./modals/create";
import { Badge, Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useGetAgentsAI } from "../../hooks/agentAI";
import { ModalDeleteAgentAI } from "./modals/delete";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { ModalEditAgentAI } from "./modals/edit";
import { FaCrown } from "react-icons/fa";
import { Tooltip } from "@components/ui/tooltip";
import { AuthContext } from "@contexts/auth.context";

export interface AgentsAIRow {
  businesses: { id: number; name: string }[];
  id: number;
  name: string;
  createAt: Date;
}

export const AgentsAIPage: React.FC = (): JSX.Element => {
  const {
    account: { isPremium },
  } = useContext(AuthContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});
  const { data: agentsAI, isFetching, isPending } = useGetAgentsAI();

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome",
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

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold flex items-center gap-x-2">
            {!isPremium && (
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
            )}
            Agentes de inteligência artificial{" "}
            <span className="font-light text-white/70">{"(IA)"}</span>
          </h1>
          <ModalCreateAgentAI
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          São sistemas de software autônomos que usam IA para realizar tarefas e
          alcançar objetivos em nome dos usuários.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="flex-1 grid">
        <TableComponent
          rows={agentsAI || []}
          columns={renderColumns}
          textEmpity="Seus agente IA aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
