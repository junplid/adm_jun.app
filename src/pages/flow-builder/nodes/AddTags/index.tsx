import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { TbTags } from "react-icons/tb";
import useStore from "../../flowStore";
import { useDBNodes } from "../../../../db";
import SelectTags from "@components/SelectTags";

type DataNode = {
  list: number[];
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const updateNode = useStore((s) => s.updateNode);
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  if (!node) return <span>Não encontrado</span>;

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      <SelectTags
        isMulti={true}
        isClearable
        placeholder="Digite e pressione `ENTER`"
        menuPlacement="bottom"
        isFlow
        value={node.data.list}
        onChange={(e: any) => {
          node.data.list = e.map((item: any) => item.value);
          updateNode(id, { data: { list: node.data.list } });
        }}
        onCreate={(tag) => {
          node.data.list.push(tag.id);
          updateNode(id, { data: { list: node.data.list } });
        }}
      />
    </div>
  );
}

export const NodeAddTags: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node adicionar etiquetas"
        description="Adiciona várias etiquetas/tags ao lead"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <TbTags
                className="dark:text-green-300 text-green-800"
                size={26.8}
              />
            </div>
          ),
          name: "Etiquetas",
          description: "Adiciona",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
