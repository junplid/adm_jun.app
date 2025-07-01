import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStop } from "react-icons/vsc";

export const NodeFinish: React.FC<Node> = () => {
  return (
    <PatternNode.PatternContainer descriptionNode="Finaliza" nameNode="fluxo">
      <div className="">
        <VscDebugStop className="dark:text-zinc-100 text-zinc-800" size={35} />
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -8, top: 26.5 }}
      />
    </PatternNode.PatternContainer>
  );
};
