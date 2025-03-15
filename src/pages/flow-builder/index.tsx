import { Box, HStack } from "@chakra-ui/react";
import { FlowContext, TypesNodes } from "@contexts/flow.context";
import { useCallback, useContext, useMemo } from "react";
import "./styles.css";
import { NodeInitial } from "./nodes/Initial";

// import { NodeMessage } from "./flow-lib/nodes/Message";
// import { NodeReply } from "./flow-lib/nodes/Reply";
// import { NodeAction } from "./flow-lib/nodes/Action";
// import { NodeAttendantAIService } from "./flow-lib/nodes/AttendantAi";
// import { NodeCheckPoint } from "./flow-lib/nodes/CheckPoint";
// import { NodeDistributeFlow } from "./flow-lib/nodes/DistributeFlow";
// import { NodeEmailSending } from "./flow-lib/nodes/EmailSending";
// import { NodeFacebookConversions } from "./flow-lib/nodes/FacebookConversions";
// import { NodeInsertLeaderInAudience } from "./flow-lib/nodes/InsertLeaderInAudience";
// import { NodeInterruption } from "./flow-lib/nodes/Interruption";
// import { NodeInterruptionLinkTrackingPixel } from "./flow-lib/nodes/InterruptionLinkTrackingPixel";
// import { NodeLinkTranckingPixel } from "./flow-lib/nodes/LinkTrackingPixel";
// import { NodeLogicalCondition } from "./flow-lib/nodes/LogicalCondition";
// import { NodeMathematicalOperators } from "./flow-lib/nodes/MathematicalOperators";
// import { NodeMenu } from "./flow-lib/nodes/Menu";
// import { NodeNewCardTrello } from "./flow-lib/nodes/NewCardTrello";
// import { NodeNotifyNumber } from "./flow-lib/nodes/NotifyNumber";
// import { NodeRemark } from "./flow-lib/nodes/Remark";
// import { NodeSendAudio } from "./flow-lib/nodes/SendAudio";
// import { NodeSendContact } from "./flow-lib/nodes/SendContact";
// import { NodeSendFile } from "./flow-lib/nodes/SendFile";
// import { NodeSendHumanService } from "./flow-lib/nodes/SendHumanService";
// import { NodeSendImage } from "./flow-lib/nodes/SendImage";
// import { NodeSendLink } from "./flow-lib/nodes/SendLink";
// import { NodeSendLocationGPS } from "./flow-lib/nodes/SendLocationGPS";
// import { NodeSendPdf } from "./flow-lib/nodes/SendPdf";
// import { NodeSendVideo } from "./flow-lib/nodes/SendVideo";
// import { NodeSwitch } from "./flow-lib/nodes/Switch";
// import { NodeTime } from "./flow-lib/nodes/Time";
// import { NodeValidation } from "./flow-lib/nodes/Validation";
// import { NodeWebform } from "./flow-lib/nodes/Webform";
// import { NodeWebhook } from "./flow-lib/nodes/Webhook";
// import { CustomEdge } from "./flow-lib/Edges/CustomEdge";
// import ToolBarFlowComponent from "./components/ToolbarFlow";

type NodeTypesGeneric = {
  [x in TypesNodes]: any;
};

import { addEdge, Background, MiniMap, Panel, ReactFlow } from "@xyflow/react";
import { useColorModeValue, ColorModeButton } from "@components/ui/color-mode";
import { LayoutPrivateContext } from "@contexts/layout-private.context";

export function FlowBuilderPage() {
  // const bgContainer = useColorModeValue("#f3f3f3", "#161619");
  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");
  const { ToggleMenu } = useContext(LayoutPrivateContext);

  const {
    reactflow: {
      nodes,
      edges,
      setEdges,
      // setNodes,
      onEdgesChange,
      onNodesChange,
    },
  } = useContext(FlowContext);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes: NodeTypesGeneric = useMemo(
    () => ({
      nodeInitial: NodeInitial,
      // nodeMessage: NodeMessage,
      // nodeReply: NodeReply,
      // nodeValidation: NodeValidation,
      // nodeMenu: NodeMenu,
      // nodeRemark: NodeRemark,
      // nodeSwitch: NodeSwitch,
      // nodeSendContact: NodeSendContact,
      // nodeSendVideo: NodeSendVideo,
      // nodeSendAudio: NodeSendAudio,
      // nodeSendImage: NodeSendImage,
      // nodeSendPdf: NodeSendPdf,
      // nodeSendLink: NodeSendLink,
      // nodeSendFile: NodeSendFile,
      // nodeSendLocationGPS: NodeSendLocationGPS,
      // nodeMathematicalOperators: NodeMathematicalOperators,
      // nodeDistributeFlow: NodeDistributeFlow,
      // nodeLogicalCondition: NodeLogicalCondition,
      // nodeInterruption: NodeInterruption,
      // nodeCheckPoint: NodeCheckPoint,
      // nodeAction: NodeAction,
      // nodeNotifyNumber: NodeNotifyNumber,
      // nodeSendHumanService: NodeSendHumanService,
      // nodeEmailSending: NodeEmailSending,
      // nodeLinkTranckingPixel: NodeLinkTranckingPixel,
      // nodeInterruptionLinkTrackingPixel: NodeInterruptionLinkTrackingPixel,
      // nodeInsertLeaderInAudience: NodeInsertLeaderInAudience,
      // nodeWebhook: NodeWebhook,
      // nodeWebform: NodeWebform,
      // nodeTime: NodeTime,
      // nodeNewCardTrello: NodeNewCardTrello,
      // nodeAttendantAI: NodeAttendantAIService,
      // nodeFacebookConversions: NodeFacebookConversions,
    }),
    []
  );

  return (
    <Box
      // bg={bgContainer}
      as={"main"}
      h={"100svh"}
    >
      {/* o header precisa ser fixado */}
      {/* <Box as={"header"}></Box> */}

      {/* <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onConnect={onConnect}
        fitView
        attributionPosition="top-right"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={["Delete"]}
        onConnectStart={(_, params) => {
          if (params.nodeId) {
            setStartConnection({
              id: params.nodeId,
              hash: String(new Date().getUTCMilliseconds()),
            });
          }
        }}
        onConnectEnd={() => setStartConnection(null)}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          opacity: 1,
          strokeWidth: 1,
        }}
        onEdgeClick={(_event, edge) => {
          setEdges((edges) => edges.filter((ed) => ed.id !== edge.id));
        }}
      >
        {/* <div
          className={`fixed bottom-4 left-14 z-50 flex items-center duration-75`}
        >
          {loadUpdateFlowStatus === true && (
            <div className="pointer-events-none flex items-center gap-x-2 bg-slate-200 p-3">
              <span className="font-semibold text-blue-600">Salvando...</span>
              <LoadSpinnerComponent size={25} />
            </div>
          )}
          {loadUpdateFlowStatus === false && (
            <div className="pointer-events-none flex items-center gap-x-2 bg-blue-600 p-3 text-white">
              <span className="font-semibold">Salvo!</span>
              <MdOutlineCloudDone size={25} />
            </div>
          )}
          {loadUpdateFlowStatus === null && (
            <div className="pointer-events-none bg-red-600 p-3">
              <BiErrorAlt size={25} />
            </div>
          )}
        </div>  
        <Controls />
        <Background
          // variant={BackgroundVariant.Lines}
          color="#909090"
          gap={10}
        />
      </ReactFlow> */}
      {/* <ToolBarFlowComponent onClickItem={(node) => addNode(node)} /> */}

      <ReactFlow
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
      >
        <MiniMap
          style={{ width: 180, height: 100 }}
          className="dark:!bg-[#37373791] !bg-[#47484971]"
        />
        <Panel
          position="top-left"
          style={{
            margin: 0,
            width: "100%",
            padding: "10px 20px",
            pointerEvents: "none",
          }}
        >
          <HStack
            pointerEvents={"none"}
            justifyContent={"space-between"}
            w={"100%"}
          >
            {ToggleMenu}
            <HStack>
              <ColorModeButton />
            </HStack>
          </HStack>
        </Panel>
        <Background color={colorDotFlow} gap={9} size={0.8} />
      </ReactFlow>
    </Box>
  );
}
