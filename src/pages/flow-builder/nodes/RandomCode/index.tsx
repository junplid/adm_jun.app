import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { TbNumber123 } from "react-icons/tb";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import SelectVariables from "@components/SelectVariables";

type DataNode = {
  count: number;
  id: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      <SelectVariables
        isMulti={false}
        isClearable
        menuPlacement="bottom"
        isFlow
        value={data.id}
        onChange={(e: any) => updateNode(id, { data: { id: e.value } })}
        onCreate={(tag) => updateNode(id, { data: { id: tag.id } })}
      />
    </div>
  );
}

export const NodeRandomCode: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node gera código randômico"
        description="Com 5 números randômicos"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <TbNumber123 className="text-white/70" size={26.8} />
            </div>
          ),
          name: "Randômico",
          description: "Código",
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
