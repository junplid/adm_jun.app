import "@xyflow/react/dist/style.css";
import "./styles.css";

import { Box, HStack } from "@chakra-ui/react";
import { useCallback, useContext, useMemo, useRef } from "react";

import {
  Background,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useColorModeValue, ColorModeButton } from "@components/ui/color-mode";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
import { useShallow } from "zustand/react/shallow";

import "react-autocomplete-input/dist/bundle.css";
import useStore from "./flowStore";
import { NodeInitial } from "./nodes/Initial";
import { NodeMessage } from "./nodes/Message";
import { NodeReply } from "./nodes/Reply";
import { NodeAddTags } from "./nodes/AddTag";
import { NodeRemoveTags } from "./nodes/RemoveTag";
import { NodeAddVariables } from "./nodes/AddVariables";
import { NodeRemoveVariables } from "./nodes/RemoveVariables";
import { NodeIF } from "./nodes/if";
import { NodeSendFlow } from "./nodes/SendFlow";
import { SearchNodesComponents } from "./components/SearchNodes";
import { DnDContext } from "@contexts/DnD.context";
import { AppNode } from "./types";
import { FeedbackComponent } from "./components/feedback";

type NodeTypesGeneric = {
  [x in TypesNodes]: any;
};

export type TypesNodes =
  | "nodeInitial"
  | "nodeMessage"
  | "nodeReply"
  | "nodeAddTags"
  | "nodeAddVariables"
  | "nodeRemoveVariables"
  | "nodeIF"
  | "nodeSendFlow"
  | "nodeRemoveTags";

const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export function FlowBuilderPage() {
  const { type } = useContext(DnDContext);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector)
  );
  const addNode = useStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  const reactFlowWrapper = useRef(null);

  const nodeTypes: NodeTypesGeneric = useMemo(
    () => ({
      nodeInitial: NodeInitial,
      nodeMessage: NodeMessage,
      nodeReply: NodeReply,
      nodeAddTags: NodeAddTags,
      nodeRemoveTags: NodeRemoveTags,
      nodeAddVariables: NodeAddVariables,
      nodeRemoveVariables: NodeRemoveVariables,
      nodeIF: NodeIF,
      nodeSendFlow: NodeSendFlow,
    }),
    []
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!type) return;
      const { x, y } = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Omit<AppNode, "id"> = {
        type,
        position: { x: x - 25, y: y - 25 },
        data: { label: `${type} node` },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, type]
  );

  return (
    <Box as={"div"} className="dndflow" h={"100svh"}>
      <div className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          // fitView
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
              <HStack className="pointer-events-auto">
                <FeedbackComponent />
                <SearchNodesComponents />
                <ColorModeButton />
              </HStack>
            </HStack>
          </Panel>
          <Background color={colorDotFlow} gap={9} size={0.8} />
        </ReactFlow>
      </div>
    </Box>
  );
}
