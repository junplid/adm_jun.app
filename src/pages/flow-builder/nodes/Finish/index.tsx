import { Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStop } from "react-icons/vsc";
import { CustomHandle } from "../../customs/node";

export const NodeFinish: React.FC<Node> = ({ id }) => {
  return (
    <PatternNode.PatternContainer descriptionNode="Finaliza" nameNode="fluxo">
      <div className="">
        <VscDebugStop className="dark:text-zinc-100 text-zinc-800" size={35} />
      </div>
      <CustomHandle
        nodeId={id}
        handleId="main"
        position={Position.Right}
        type="source"
        style={{ right: -8, top: "calc(50% + 3px)" }}
        isConnectable={true}
      />
    </PatternNode.PatternContainer>
  );
};
