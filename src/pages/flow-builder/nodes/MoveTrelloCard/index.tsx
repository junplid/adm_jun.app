import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectTrelloIntegrations from "@components/SelectTrelloIntegrations";
import { RiTrelloLine } from "react-icons/ri";
import SelectVariables from "@components/SelectVariables";
import SelectBoardsTrelloIntegration from "@components/SelectBoardsTrelloIntegration";
import SelectListsOnBoardTrelloIntegration from "@components/SelectListsOnBoardTrelloIntegration";

type DataNode = {
  trelloIntegrationId: number;
  varId_cardId: number;
  boardId: string;
  listId: string;
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

      <span className="font-bold text-center block -mb-2">Mover para:</span>

      {data.trelloIntegrationId && (
        <Field label="Selecione o quadro" required>
          <SelectBoardsTrelloIntegration
            trelloIntegrationId={data.trelloIntegrationId}
            value={data.boardId}
            isMulti={false}
            isClearable={false}
            onChange={(v: any) => {
              updateNode(id, {
                data: { ...data, boardId: v.value },
              });
            }}
            menuPlacement="bottom"
            isFlow
          />
        </Field>
      )}

      {data.boardId && (
        <Field label="Selecione a nova lista" required>
          <SelectListsOnBoardTrelloIntegration
            trelloIntegrationId={data.trelloIntegrationId}
            boardId={data.boardId}
            value={data.listId}
            isMulti={false}
            isClearable={false}
            onChange={(v: any) => {
              updateNode(id, {
                data: { ...data, listId: v.value },
              });
            }}
            menuPlacement="bottom"
            isFlow
          />
        </Field>
      )}
    </div>
  );
}

export const NodeMoveTrelloCard: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Mover card no Trello"
        description="Mova um card do quadro"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="320px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiTrelloLine
                className="dark:text-yellow-400  text-yellow-500"
                size={31}
              />
            </div>
          ),
          name: "Card",
          description: "Mover",
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
