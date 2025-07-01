import { JSX } from "react";
import { Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { useDBNodes } from "../../../../db";
import SelectVariables from "@components/SelectVariables";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import { PiEarBold } from "react-icons/pi";
import { LuMessageCircleHeart } from "react-icons/lu";

type DataNode = {
  varIdToReaction?: number;
  varIdToMessage?: number;
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const updateNode = useStore((s) => s.updateNode);
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  if (!node) return <span>Não encontrado</span>;

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      <Field label="Variável para guardar a reação">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={node.data.varIdToReaction}
          // onChange={(e: any) => {
          //   console.log(e);
          //   updateNode(id, {
          //     data: { ...node.data, varIdToReaction: e.value },
          //   });
          // }}
          onCreate={(d) => {
            updateNode(id, { data: { ...node.data, varIdToReaction: d.id } });
          }}
        />
      </Field>
      <Field
        helperText="Salvará o texto da mensagem que foi reagida em uma variável."
        label="Variável para guardar a mensagem"
      >
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={node.data.varIdToMessage}
          onChange={(e: any) => {
            updateNode(id, { data: { ...node.data, varIdToMessage: e.value } });
          }}
          onCreate={(d) => {
            updateNode(id, { data: { ...node.data, varIdToMessage: d.id } });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeListenReaction: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node escutar reações"
        description="Escuta reações de todas as mensagens enviadas pela conexão WA do fluxo."
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <PiEarBold
                className="dark:text-white translate-x-1 text-black/70"
                size={26.8}
              />
              <LuMessageCircleHeart
                className="dark:text-red-300 absolute top-4 left-[1px] text-black/70"
                size={13}
              />
            </div>
          ),
          name: "Reações",
          description: "Escutar",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

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
