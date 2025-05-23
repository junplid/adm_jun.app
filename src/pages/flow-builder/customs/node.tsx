import { JSX, useEffect, useState } from "react";
import {
  Handle,
  HandleType,
  Node,
  Position,
  getConnectedEdges,
  useReactFlow,
  useStore,
} from "@xyflow/react";

interface PropsConnectableFn {
  nodeId: string;
  handleId: string;
}

const useConnectableFn = ({ handleId, nodeId }: PropsConnectableFn) => {
  const edgesCount = useStore((store) => store.edges.length);
  const { getNode, getEdges } = useReactFlow();

  const [hasConnections, setHasConnections] = useState(false);

  useEffect(() => {
    // const node = getNode(nodeId);

    setHasConnections(() => {
      const edges = getConnectedEdges(
        [getNode(nodeId) as Node],
        getEdges()
      ).filter((e) => (e["source"] as any) === nodeId);

      const idConnected = edges.some((ed) => ed.sourceHandle === handleId);
      return idConnected;
    });
  }, [getNode, getEdges, nodeId, edgesCount]);

  return hasConnections;
};

interface PropsCustomHandle {
  nodeId: string;
  handleId: string;
  type: HandleType;
  position: Position;
  style?: React.CSSProperties;
  isConnectable?: boolean;
  className?: string;
}

export const CustomHandle: React.FC<PropsCustomHandle> = ({
  nodeId,
  handleId,
  isConnectable,
  ...props
}): JSX.Element => {
  const hasSourceConnections = useConnectableFn({ handleId, nodeId });
  // const { getNode, getEdges } = useReactFlow();

  return (
    <Handle
      // onConnect={(connect) => {
      //   const nodeSource = getNode(
      //     (connect.source || connect.sourceHandle) as string
      //   );
      //   const nodeTarget = getNode(
      //     (connect.target || connect.targetHandle) as string
      //   );

      //   console.log({ nodeSource, nodeTarget, connect });
      // }}
      {...props}
      id={handleId}
      isConnectable={isConnectable ? !hasSourceConnections : false}
    />
  );
};
