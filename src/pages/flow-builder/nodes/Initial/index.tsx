import { Handle, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStart } from "react-icons/vsc";

export const NodeInitial: React.FC = () => {
  return (
    <PatternNode.PatternContainer descriptionNode="Inicia" nameNode="fluxo">
      <div className="">
        <VscDebugStart className="dark:text-zinc-100 text-zinc-800" size={35} />
      </div>
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </PatternNode.PatternContainer>
  );
};
