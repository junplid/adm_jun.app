import { JSX, useMemo } from "react";
import { Column, TableComponent } from "../../components/Table";
import moment from "moment";
import { useDialogModal } from "../../hooks/dialog.modal";
import { ModalCreateAgentAI } from "./modals/create";
import { Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useGetAgentsAI } from "../../hooks/agentAI";
import { ModalDeleteAgentAI } from "./modals/delete";
import { MdDeleteOutline } from "react-icons/md";

export interface AgentsAIRow {
  businesses: { id: number; name: string }[];
  id: number;
  name: string;
  createAt: Date;
}

export const AgentsAIPage: React.FC = (): JSX.Element => {
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
            <div className="flex h-full items-center gap-x-1.5">
              {/* <ModalView
             setAttendantsAI={setAttendantsAI}
             id={row.id}
             buttonJSX={(open) => (
               <Button
                 onClick={open}
                 size={"sm"}
                 bg={"#60c4eb39"}
                 _hover={{ bg: "#60c4eb63" }}
               >
                 <LuEye size={18} color={"#92f2ff"} />
               </Button>
             )}
           /> 
           <ModalEdit
             id={row.id ?? 0}
             setAIs={setAttendantsAI}
             buttonJSX={(onOpen) => (
               <Button
                 onClick={onOpen}
                 size={"sm"}
                 bg={"#608ceb39"}
                 _hover={{ bg: "#6098eb61" }}
               >
                 <MdEdit size={18} color={"#9ec9fa"} />
               </Button>
             )}
           /> */}
              <Button
                size={"sm"}
                bg={"#eb606013"}
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
          <h1 className="text-lg font-semibold">
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
          textEmpity="Nenhum agente IA criado."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
