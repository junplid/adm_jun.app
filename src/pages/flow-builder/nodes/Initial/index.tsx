import { Handle, Position } from "@xyflow/react";
import { AiOutlinePlayCircle } from "react-icons/ai";
import { PatternNode } from "../Pattern";
import { Box } from "@chakra-ui/react";
import { BsSkipStartCircle } from "react-icons/bs";
import { VscDebugStart } from "react-icons/vsc";

export const NodeInitial: React.FC = () => {
  return (
    <PatternNode.PatternContainer
      descriptionNode="Inicia o fluxo"
      nameNode="Start"
    >
      <VscDebugStart size={30} />
      <Handle type="source" position={Position.Right} style={{ right: -15 }} />
    </PatternNode.PatternContainer>
  );
};
