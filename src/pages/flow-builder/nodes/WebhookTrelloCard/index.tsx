import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import { RiTrelloLine } from "react-icons/ri";
import SelectVariables from "@components/SelectVariables";

type DataNode = {
  varId_cardId?: number;
  varId_save_listBeforeId?: number;
  varId_save_listAfterId?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

  return (
    <div className="flex flex-col -mt-3 mb-2 gap-y-3">
      <Field
        label="Selecione a variável"
        helperText="Selecione a variável com o ID do card cujo deseja escutar as mudanças"
      >
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_cardId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_cardId: e.value },
            });
          }}
        />
      </Field>

      <Field label="Salvar o nome da lista origem">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_save_listBeforeId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_save_listBeforeId: e.value },
            });
          }}
        />
      </Field>

      <Field label="Salvar o nome da lista destino">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_save_listAfterId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_save_listAfterId: e.value },
            });
          }}
        />
      </Field>

      <div className="flex flex-col">
        <span className="font-semibold text-yellow-400 uppercase">
          ⚠️ Importante !
        </span>
        <span className=" text-white/70">
          O fluxo não muda de direção. Esse node é usado apenas para notificar
          seu atendimento.
        </span>
      </div>
    </div>
  );
}

export const NodeWebhookTrelloCard: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Webhook card do Trello"
        description="Escutar mudanças de lista do card"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="320px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiTrelloLine className="dark:text-white  text-black" size={31} />
            </div>
          ),
          name: "Card",
          description: "Webhook",
        }}
      >
        <BodyNode id={id} data={data} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <CustomHandle
        nodeId={id}
        handleId="main"
        position={Position.Right}
        type="source"
        style={{ right: -8 }}
        isConnectable={true}
      />
    </div>
  );
};
