import { Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStart } from "react-icons/vsc";
import { CustomHandle } from "../../customs/node";

export const NodeInitial: React.FC<Node> = ({ id }) => {
  return (
    <PatternNode.PatternContainer descriptionNode="Inicia" nameNode="fluxo">
      <div className="">
        <VscDebugStart className="text-zinc-100" size={35} />
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
