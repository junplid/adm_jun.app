import { Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { VscDebugStart } from "react-icons/vsc";
import { CustomHandle } from "../../customs/node";

export const NodeInitial: React.FC<Node> = ({ id }) => {
  return (
    <PatternNode.PatternContainer descriptionNode="Inicia" nameNode="fluxo">
      <div className="">
        <VscDebugStart className="dark:text-zinc-100 text-zinc-800" size={35} />
      </div>
      <CustomHandle
        nodeId={id}
        handleId="main"
        position={Position.Right}
        type="source"
        style={{ right: -8 }}
        isConnectable={true}
      />
    </PatternNode.PatternContainer>
  );
};
