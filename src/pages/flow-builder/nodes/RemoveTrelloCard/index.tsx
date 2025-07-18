import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectTrelloIntegrations from "@components/SelectTrelloIntegrations";
import { RiTrelloLine } from "react-icons/ri";
import SelectVariables from "@components/SelectVariables";

type DataNode = {
  trelloIntegrationId: number;
  varId_cardId?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

  return (
    <div className="flex flex-col -mt-3 mb-5 gap-y-3">
      <Field label="Selecione a integração">
        <SelectTrelloIntegrations
          value={data.trelloIntegrationId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, {
              data: { ...data, trelloIntegrationId: v.value },
            });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>
      <Field label="Selecione a variável com o ID do card">
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
    </div>
  );
}

export const NodeRemoveTrelloCard: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Remover card no Trello"
        description="Remove um card da lista"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="320px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiTrelloLine
                className="dark:text-red-400  text-red-500"
                size={31}
              />
            </div>
          ),
          name: "Card",
          description: "Remover",
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
