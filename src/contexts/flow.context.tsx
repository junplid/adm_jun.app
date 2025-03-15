import {
  createContext,
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addEdge,
  Connection,
  ConnectionLineType,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type TypesNodes = "nodeInitial";
//   | "nodeMessage";
//   | "nodeReply"
//   | "nodeValidation"
//   | "nodeRemark"
//   | "nodeSwitch"
//   | "nodeSendContact"
//   | "nodeSendVideo"
//   | "nodeSendAudio"
//   | "nodeSendImage"
//   | "nodeSendPdf"
//   | "nodeSendLink"
//   | "nodeSendFile"
//   | "nodeSendLocationGPS"
//   | "nodeMathematicalOperators"
//   | "nodeDistributeFlow"
//   | "nodeLogicalCondition"
//   | "nodeInterruption"
//   | "nodeCheckPoint"
//   | "nodeAction"
//   | "nodeNotifyNumber"
//   | "nodeSendHumanService"
//   | "nodeEmailSending"
//   | "nodeLinkTranckingPixel"
//   | "nodeInterruptionLinkTrackingPixel"
//   | "nodeInsertLeaderInAudience"
//   | "nodeWebhook"
//   | "nodeWebform"
//   | "nodeTime"
//   | "nodeNewCardTrello"
//   | "nodeAttendantAI"
//   | "nodeFacebookConversions"
//   | "nodeMenu";

interface PropsFlowContext_I {
  reactflow: {
    nodes: Node[];
    edges: Edge[];
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>;
    setNodes: Dispatch<SetStateAction<Node<any>[]>>;
    onNodesChange: any;
    onEdgesChange: any;
    onConnect(params: Edge | Connection): void;
    onEdgeUpdateStart(): void;
    // onEdgeUpdate(oldEdge: Edge, newConnection: Connection): void;
    onEdgeUpdateEnd(_: any, edge: Edge): void;
    addNode(typeOfNode: TypesNodes): void;
    setStartConnection(data: { id: string; hash: string } | null): void;
    startConnection: { id: string; hash: string } | null;
  };
}

export const FlowContext = createContext({} as PropsFlowContext_I);

interface PropsProviderFlowContext_I {
  children: JSX.Element;
}

export const FlowProvider = ({
  children,
}: PropsProviderFlowContext_I): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    { id: "0", type: "nodeInitial", position: { x: 200, y: 200 }, data: {} },
    { id: "1", type: "nodeMessage", position: { x: 100, y: 100 }, data: {} },
    // { id: "1", type: "nodeMessage", position: { x: 200, y: 100 }, data: {} },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [startConnection, setStartConnection] = useState<{
    id: string;
    hash: string;
  } | null>(null);
  const edgeUpdateSuccessful = useRef(true);

  const onConnect = useCallback((params: Edge | Connection) => {
    const isColor = /\s/.test(params.sourceHandle ?? "");

    setEdges((els) =>
      addEdge(
        {
          ...params,
          type: ConnectionLineType.SmoothStep,
          animated: true,
          // style: {
          //   stroke: isColor ? params.sourceHandle?.split(/\s/)[0] : "#d6d6d6",
          //   strokeWidth: 2,
          //   fill: "none",
          // },
        },
        els
      )
    );
  }, []);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  // const onEdgeUpdate = useCallback(
  //   (oldEdge: Edge, newConnection: Connection) => {
  //     edgeUpdateSuccessful.current = true;
  //     setEdges((els) => updateEdge(oldEdge, newConnection, els));
  //   },
  //   []
  // );

  const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const addNode = useCallback(
    (typeOfNode: TypesNodes) => {
      setNodes([
        ...nodes,
        {
          data: {},
          id: `${Math.floor(Math.random() * 9999999)}`,
          type: typeOfNode,
          position: {
            x: nodes[nodes.length - 1].position.x + 250,
            y: nodes[nodes.length - 1].position.y,
          },
        },
      ]);
    },
    [nodes]
  );

  const dataValue = useMemo(() => {
    return {
      reactflow: {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        addNode,
        setEdges,
        setNodes,
        setStartConnection,
        startConnection,
      },
    };
  }, [nodes, edges, startConnection]);

  return (
    <FlowContext.Provider value={dataValue}>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </FlowContext.Provider>
  );
};
