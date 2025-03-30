import "@xyflow/react/dist/style.css";
import "./styles.css";

import { Box, HStack, Presence, Spinner } from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
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
import useSyncLoadStore from "./syncLoadStore";
import { IoSaveOutline } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import { useParams } from "react-router-dom";
import { getVariables } from "../../services/api/Variable";
import { db } from "../../db";

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
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  const reactFlowWrapper = useRef(null);

  const params = useParams<{ id: string }>();

  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");

  const {
    load: syncLoad,
    // setLoad
  } = useSyncLoadStore((s) => s);

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

  // useEffect(() => {
  //   const syncdebause = setTimeout(() => {
  //     setLoad("load");
  //     setTimeout(() => {
  //       setLoad("save");
  //     }, 2000);
  //   }, 1000);
  //   return () => {
  //     clearInterval(syncdebause);
  //     setLoad("hidden");
  //   };
  // }, [nodes, edges]);

  useEffect(() => {
    if (params.id) {
      (async () => {
        // buscar informações do fluxo e do data fluxo;
        const variables = await getVariables({});
        db.variables.bulkAdd(
          variables.map((v) => ({ name: v.name, id: v.id }))
        );
      })();
    }
  }, [params.id]);

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
              <HStack className="w-full relative">
                {ToggleMenu}
                <div className=" w-full">
                  <Presence
                    animationName={{
                      // _open: "slide-from-top, fade-in",
                      _closed: "slide-to-top, fade-out",
                    }}
                    animationDuration="moderate"
                    present={syncLoad === "load"}
                    top={"2px"}
                    position={"absolute"}
                  >
                    <Spinner color={"whiteAlpha.700"} />
                  </Presence>

                  <Presence
                    animationName={{
                      _open: "slide-from-top, fade-in",
                      _closed: "slide-to-top, fade-out",
                    }}
                    animationDuration="moderate"
                    present={syncLoad === "save"}
                    top={"2px"}
                    position={"absolute"}
                  >
                    <IoSaveOutline size={20} color="#1db4e7" />
                  </Presence>
                  <Presence
                    animationName={{
                      _open: "slide-from-top, fade-in",
                      _closed: "slide-to-top, fade-out",
                    }}
                    animationDuration="moderate"
                    present={syncLoad === "error"}
                    top={"1px"}
                    position={"absolute"}
                    w={"full"}
                    className="gap-x-2 text-red-500 flex items-center w-full"
                  >
                    <RiErrorWarningLine size={22} />
                    <span className="text-base">
                      Erro de sincronização! Se o erro persistir, contate o
                      suporte.
                    </span>
                  </Presence>
                </div>
              </HStack>
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
