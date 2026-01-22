import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStop } from "react-icons/vsc";

export const NodeFinish: React.FC<Node> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternContainer descriptionNode="Finaliza" nameNode="fluxo">
        <div className="p-[3.5px] relative">
          <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
            <PatternNode.Actions id={id} />
          </div>
          <VscDebugStop className="text-zinc-100" size={28} />
        </div>
      </PatternNode.PatternContainer>
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -8, top: 26.5 }}
      />
    </div>
  );
};
