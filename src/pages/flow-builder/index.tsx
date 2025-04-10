import "react-autocomplete-input/dist/bundle.css";
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
import { useGetFlowData, useUpdateFlowData } from "../../hooks/flow";
import { nanoid } from "nanoid";
import CustomEdge from "./customs/edge";

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

const edgeTypes = {
  customedge: CustomEdge,
};

export function FlowBuilderPage() {
  const params = useParams<{ id: string }>();
  const { type } = useContext(DnDContext);
  const {
    data: flowData,
    isFetching,
    isError,
  } = useGetFlowData(Number(params.id));

  const {
    nodes,
    changes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetChanges,
    onNodesDelete,
    onEdgeClick,
  } = useStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      setNodes: s.setNodes,
      changes: s.changes,
      setChange: s.setChange,
      resetChanges: s.resetChanges,
      onNodesDelete: s.onNodesDelete,
      setEdges: s.setEdges,
      onEdgeClick: s.onEdgeClick,
    }))
  );

  const { screenToFlowPosition } = useReactFlow();
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  const reactFlowWrapper = useRef(null);
  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");
  const { load: syncLoad, setLoad } = useSyncLoadStore((s) => s);

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
      const newNode: AppNode = {
        id: nanoid(),
        type,
        position: { x: x - 25, y: y - 25 },
        data: {},
        deletable: true,
      };
      db.nodes.add({
        id: newNode.id,
        data: newNode.data,
      });
      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, type]
  );

  const {
    mutateAsync: updateFlowData,
    isPending,
    isError: isErrorSync,
  } = useUpdateFlowData({
    async onSuccess() {
      setLoad("save");
      resetChanges();
    },
  });

  // primeiro pull do fluxo
  useEffect(() => {
    if (flowData?.name) {
      setNodes(
        flowData.nodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          data: {},
          position: n.position,
          deletable: n.deletable,
        }))
      );

      setEdges(
        flowData.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        }))
      );

      (async () => {
        await db.nodes.clear();
        await db.nodes.bulkAdd(
          flowData.nodes.map((n: any) => ({
            id: n.id,
            data: n.data,
          }))
        );
        await db.variables.clear();
        const variables = await getVariables({
          businessIds: flowData.businessIds,
        });
        db.variables.bulkAdd(
          variables.map((v) => ({ name: v.name, id: v.id }))
        );
      })();
    }

    return () => {
      setNodes([]);
      setEdges([]);
      resetChanges();
      // db.nodes.clear();
      // db.variables.clear();
    };
  }, [flowData?.name]);

  // sincroniza o fluxo
  useEffect(() => {
    const handleKey = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setLoad("load");

        if (!changes.nodes.length && !changes.edges.length) {
          return;
        }

        const nodesxx = await Promise.all(
          changes.nodes.map(async (n) => {
            if (n.type === "delete") {
              return { type: n.type, node: { id: n.id } };
            }
            const { position, type, deletable } = nodes.find(
              (node) => node.id === n.id
            )!;
            return {
              type: n.type,
              node: {
                position,
                type,
                id: n.id,
                deletable,
                data: (await db.nodes.get(n.id))?.data,
              },
            };
          })
        );

        const edgesxx = await Promise.all(
          changes.edges.map(async (ed) => {
            if (ed.type === "delete") {
              return { type: ed.type, edge: { id: ed.id } };
            }
            const findEdge = edges.find((node) => node.id === ed.id)!;
            return {
              type: ed.type,
              edge: {
                id: ed.id,
                source: findEdge.source,
                target: findEdge.target,
                sourceHandle: findEdge.sourceHandle,
                targetHandle: findEdge.targetHandle,
              },
            };
          })
        );

        updateFlowData({
          id: Number(params.id),
          body: { nodes: nodesxx, edges: edgesxx },
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changes]);

  const isSave = useMemo(() => {
    return !!(changes.nodes.length || changes.edges.length);
  }, [changes.edges, changes.nodes]);

  return (
    <Box as={"div"} className="dndflow" h={"100svh"}>
      <Presence
        animationName={{
          _open: "slide-from-top, fade-in",
          _closed: "slide-to-top, fade-out",
        }}
        animationDuration="moderate"
        present={isFetching}
        position={"absolute"}
        top={0}
        left={0}
        zIndex={99999}
        className="absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center"
      >
        <div className="flex items-center justify-center gap-x-5">
          <Spinner borderWidth="2px" color="teal.500" size="md" />
          <div>
            <div className="text-lg font-bold text-gray-500 dark:text-gray-200">
              Carregando fluxo...
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-400">
              Aguarde enquanto carregamos os dados do fluxo.
            </div>
          </div>
        </div>
      </Presence>

      {!isFetching && !isError && flowData?.name && (
        <div className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            snapToGrid={true}
            // snapGrid={[60, 80]}
            edgeTypes={edgeTypes}
            onEdgeClick={onEdgeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            attributionPosition="top-right"
            fitView
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
                      present={isPending}
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
                      <div className="flex items-center gap-x-2 text-white/70">
                        <IoSaveOutline size={20} color="#1db4e7" />
                        <span>Salvo</span>
                      </div>
                    </Presence>
                    <Presence
                      animationName={{
                        _open: "slide-from-top, fade-in",
                        _closed: "slide-to-top, fade-out",
                      }}
                      animationDuration="moderate"
                      present={isErrorSync}
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
            <Panel
              position="bottom-left"
              style={{
                margin: 0,
                padding: "10px 20px",
                pointerEvents: "none",
              }}
            >
              <Presence
                animationName={{
                  _open: "slide-from-bottom, fade-in",
                  _closed: "slide-to-bottom, fade-out",
                }}
                animationDuration="moderate"
                present={isSave}
              >
                <span className="text-sm text-white/60">
                  Pressione <strong className="text-white">CTRL</strong> +{" "}
                  <strong className="text-white">S</strong> para salvar
                </span>
              </Presence>
            </Panel>
            <Panel
              position="bottom-center"
              style={{
                margin: 0,
                padding: "10px 20px",
                pointerEvents: "none",
              }}
            >
              <span className="block relative text-sm font-medium">
                {flowData.name}
                {isSave && (
                  <strong className="text-blue-500 absolute -right-3 text-xl -top-2">
                    *
                  </strong>
                )}
              </span>
            </Panel>
            <Background color={colorDotFlow} gap={9} size={0.8} />
          </ReactFlow>
        </div>
      )}

      <Presence
        animationName={{
          _open: "slide-from-top, fade-in",
          _closed: "slide-to-top, fade-out",
        }}
        animationDuration="moderate"
        present={isError && !isFetching}
        position={"absolute"}
        top={0}
        left={0}
        zIndex={99999}
        className="absolute top-0 left-0 w-full h-full z-50 flex justify-center"
      >
        <div className="flex items-center flex-col gap-y-0.5 mt-14">
          <div className="text-lg font-bold text-gray-500 dark:text-gray-200">
            Fluxo não encontrado
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-400">
            O construtor de fluxo que você está tentando acessar não existe ou
            foi excluído.
          </div>
        </div>
      </Presence>
    </Box>
  );
}
