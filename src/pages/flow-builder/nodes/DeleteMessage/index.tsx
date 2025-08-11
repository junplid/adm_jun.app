import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX } from "react";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { TbTextSize } from "react-icons/tb";

type DataNode = {
  varId_messageId?: number;
  varId_groupJid?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      <Field label="ID da mensagem" required>
        <SelectVariables
          isMulti={false}
          isClearable={false}
          placeholder="Selecione a variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_messageId}
          onChange={(e: any) => {
            if (!e) {
              updateNode(id, {
                data: { ...data, varId_messageId: undefined },
              });
              return;
            }
            updateNode(id, {
              data: { ...data, varId_messageId: Number(e.value) },
            });
          }}
          onCreate={(tag) => {
            updateNode(id, {
              data: { ...data, varId_messageId: tag.id },
            });
          }}
        />
      </Field>

      <Field
        label="ID do grupo"
        helperText="Para mensagens enviadas em grupos, este campo é obrigatório."
      >
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione a variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_groupJid}
          onChange={(e: any) => {
            if (!e) {
              updateNode(id, {
                data: { ...data, varId_groupJid: undefined },
              });
              return;
            }
            updateNode(id, {
              data: { ...data, varId_groupJid: Number(e.value) },
            });
          }}
          onCreate={(tag) => {
            updateNode(id, {
              data: { ...data, varId_groupJid: tag.id },
            });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeDeleteMessage: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node deletar mensagem"
        description="Deleta mensagem em grupo ou privado"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <TbTextSize
                className="dark:text-red-600 text-red-800"
                size={31}
              />
            </div>
          ),
          name: "Deletar",
          description: "Mensagem",
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
