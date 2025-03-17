import { Box, HStack } from "@chakra-ui/react";
import { TypesNodes } from "@contexts/flow.context";
import { useContext, useMemo } from "react";

import "@xyflow/react/dist/style.css";
import "./styles.css";

type NodeTypesGeneric = {
  [x in TypesNodes]: any;
};

import { Background, MiniMap, Panel, ReactFlow } from "@xyflow/react";
import { useColorModeValue, ColorModeButton } from "@components/ui/color-mode";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
import { useShallow } from "zustand/react/shallow";

import useStore from "./flowStore";
import { NodeInitial } from "./nodes/Initial";
import { NodeMessage } from "./nodes/Message";

const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export function FlowBuilderPage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector)
  );
  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");
  const { ToggleMenu } = useContext(LayoutPrivateContext);

  const nodeTypes: NodeTypesGeneric = useMemo(
    () => ({
      nodeInitial: NodeInitial,
      nodeMessage: NodeMessage,
    }),
    []
  );

  return (
    <Box as={"main"} h={"100svh"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
