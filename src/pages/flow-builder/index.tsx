import "react-autocomplete-input/dist/bundle.css";
import "@xyflow/react/dist/style.css";
import "./styles.css";

import { Box, HStack, Presence, Spinner } from "@chakra-ui/react";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Background,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import {
  useColorModeValue,
  // ColorModeButton
} from "@components/ui/color-mode";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
import { useShallow } from "zustand/react/shallow";
import useStore from "./flowStore";
import { NodeInitial } from "./nodes/Initial";
import { NodeMessage } from "./nodes/Message";
import { NodeReply } from "./nodes/Reply";
import { NodeAddTags } from "./nodes/AddTags";
import { NodeRemoveTags } from "./nodes/RemoveTags";
import { NodeAddVariables } from "./nodes/AddVariables";
import { NodeRemoveVariables } from "./nodes/RemoveVariables";
import { NodeIF } from "./nodes/if";
import { NodeSendFlow } from "./nodes/SendFlow";
import { SearchNodesComponents } from "./components/SearchNodes";
import { AppNode } from "./types";
import { toaster } from "@components/ui/toaster";
import useSyncLoadStore from "./syncLoadStore";
import { RiErrorWarningLine, RiSaveFill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import { useUpdateFlowData } from "../../hooks/flow";
import { nanoid } from "nanoid";
import CustomEdge from "./customs/edge";
import { FlowType, getFlowData } from "../../services/api/Flow";
import { NodeTimer } from "./nodes/Timer";
import { NodeMenu } from "./nodes/Menu";
import { NodeNotifyWA } from "./nodes/NotifyWA";
import { NodeSendFiles } from "./nodes/SendFiles";
import { NodeSendImages } from "./nodes/SendImages";
import { NodeSendVideos } from "./nodes/SendVideos";
import { NodeSendAudiosLive } from "./nodes/SendAudiosLive";
import { NodeSendAudios } from "./nodes/SendAudios";
import { NodeAgentAI } from "./nodes/AgentAI";
import { NodeTransferDepartment } from "./nodes/TransferDepartment";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { NodeFbPixel } from "./nodes/FbPixel";
import { NodeListenReaction } from "./nodes/ListenReaction";
import { NodeExtractVariable } from "./nodes/ExtractVariable";
import { NodeSwitchVariable } from "./nodes/SwitchVariable";
import { NodeCharge } from "./nodes/Charge";
import { NodeRandomCode } from "./nodes/RandomCode";
import { NodeFinish } from "./nodes/Finish";
import { NodeSendTextGroup } from "./nodes/SendTextGroup";
import { NodeCreateOrder } from "./nodes/CreateOrder";
import { NodeUpdateOrder } from "./nodes/UpdateOrder";
import { NodeTimedQueue } from "./nodes/TimedQueue";
import { NodeCalculator } from "./nodes/Calculator";
import { NodeAddTrelloCard } from "./nodes/AddTrelloCard";
import { NodeRemoveTrelloCard } from "./nodes/RemoveTrelloCard";
import { NodeUpdateTrelloCard } from "./nodes/updateTrelloCard";
import { NodeMoveTrelloCard } from "./nodes/MoveTrelloCard";
import { NodeWebhookTrelloCard } from "./nodes/WebhookTrelloCard";

type NodeTypesGeneric = {
  [x in TypesNodes]: any;
};

export type TypesNodes =
  | "NodeInitial"
  | "NodeAddTags"
  | "NodeAddVariables"
  | "NodeReply"
  | "NodeFinish"
  | "NodeMessage"
  | "NodeRemoveVariables"
  | "NodeIF"
  | "NodeSendFlow"
  | "NodeTimer"
  | "NodeMenu"
  | "NodeNotifyWA"
  | "NodeSendFiles"
  | "NodeSendImages"
  | "NodeSendVideos"
  | "NodeSendAudiosLive"
  | "NodeSendAudios"
  | "NodeRemoveTags"
  | "NodeTransferDepartment"
  | "NodeAgentAI"
  | "NodeFbPixel"
  | "NodeListenReaction"
  | "NodeExtractVariable"
  | "NodeSwitchVariable"
  | "NodeCharge"
  | "NodeRandomCode"
  | "NodeSendTextGroup"
  | "NodeCreateOrder"
  | "NodeUpdateOrder"
  | "NodeTimedQueue"
  | "NodeCalculator"
  | "NodeAddTrelloCard"
  | "NodeRemoveTrelloCard"
  | "NodeUpdateTrelloCard"
  | "NodeMoveTrelloCard"
  | "NodeWebhookTrelloCard";

const nodeTypes: NodeTypesGeneric = {
  NodeInitial: NodeInitial,
  NodeAddTags: NodeAddTags,
  NodeAddVariables: NodeAddVariables,
  NodeFinish: NodeFinish,
  NodeMessage: NodeMessage,
  NodeReply: NodeReply,
  NodeTimer: NodeTimer,
  NodeRemoveTags: NodeRemoveTags,
  NodeRemoveVariables: NodeRemoveVariables,
  NodeIF: NodeIF,
  NodeSendFlow: NodeSendFlow,
  NodeMenu: NodeMenu,
  NodeNotifyWA: NodeNotifyWA,
  NodeSendFiles: NodeSendFiles,
  NodeSendImages: NodeSendImages,
  NodeSendVideos: NodeSendVideos,
  NodeSendAudiosLive: NodeSendAudiosLive,
  NodeSendAudios: NodeSendAudios,
  NodeAgentAI: NodeAgentAI,
  NodeTransferDepartment: NodeTransferDepartment,
  NodeFbPixel: NodeFbPixel,
  NodeListenReaction: NodeListenReaction,
  NodeExtractVariable: NodeExtractVariable,
  NodeSwitchVariable: NodeSwitchVariable,
  NodeCharge: NodeCharge,
  NodeRandomCode: NodeRandomCode,
  NodeSendTextGroup: NodeSendTextGroup,
  NodeCreateOrder: NodeCreateOrder,
  NodeUpdateOrder: NodeUpdateOrder,
  NodeTimedQueue: NodeTimedQueue,
  NodeCalculator: NodeCalculator,
  NodeAddTrelloCard: NodeAddTrelloCard,
  NodeRemoveTrelloCard: NodeRemoveTrelloCard,
  NodeUpdateTrelloCard: NodeUpdateTrelloCard,
  NodeMoveTrelloCard: NodeMoveTrelloCard,
  NodeWebhookTrelloCard: NodeWebhookTrelloCard,
};

const edgeTypes = {
  customedge: CustomEdge,
};

interface IBody {
  id: string;
  flowData: {
    name: string;
    type: FlowType;
    businessIds: number[];
    nodes: any[];
    edges: any[];
  };
}

function Body(props: IBody): JSX.Element {
  const {
    nodes,
    changes,
    edges,
    typeDrag,
    setTypeDrag,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    resetChanges,
    onNodesDelete,
    onEdgeClick,
    setBusinessIds,
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
      setBusinessIds: s.setBusinessIds,
      setIsPull: s.setIsPull,
      typeDrag: s.typeDrag,
      setTypeDrag: s.setTypeDrag,
    }))
  );

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const colorDotFlow = useColorModeValue("#c6c6c6", "#373737");
  const { load: syncLoad, setLoad } = useSyncLoadStore((s) => s);
  const [viewReady, setViewReady] = useState(false);

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

  useEffect(() => {
    setBusinessIds(props.flowData.businessIds);
    setNodes(
      props.flowData.nodes.map((n: any) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: n.position,
        deletable: n.deletable,
        preview: n.preview,
      }))
    );

    setEdges(
      props.flowData.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }))
    );
    return () => {
      setNodes([]);
      setEdges([]);
      resetChanges();
    };
  }, [props.flowData.name]);

  const isSave = useMemo(() => {
    // console.log(changes);
    return !!(changes.nodes.length || changes.edges.length);
  }, [changes.edges, changes.nodes]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: any) => {
      event.preventDefault();
      if (!typeDrag) return;
      const { x, y } = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: AppNode = {
        id: nanoid(),
        type: typeDrag,
        position: { x: x - 25, y: y - 25 },
        data: {},
        deletable: true,
      };
      const typeN = typeDrag as TypesNodes;
      if (typeN === "NodeAddTags") {
        newNode.data = { list: [] };
      } else if (typeN === "NodeAddVariables") {
        newNode.data = { list: [] };
      } else if (typeN === "NodeExtractVariable") {
        newNode.data = {
          flags: [],
        };
      } else if (typeN === "NodeMessage") {
        newNode.data = {
          messages: [{ text: "", key: nanoid(), interval: 0 }],
        };
      } else if (typeN === "NodeIF") {
        newNode.data = {
          list: [{ key: nanoid(), name: "has-tags", tagIds: [] }],
        };
      } else if (typeN === "NodeMenu") {
        newNode.data = {
          interval: 5,
          items: [],
          validateReply: {
            attempts: 2,
            messageErrorAttempts: { interval: 3 },
          },
          timeout: { type: ["minutes"], value: 20 },
          preview: [],
        };
      } else if (typeN === "NodeNotifyWA") {
        newNode.data = { numbers: [], tagsIds: [] };
      } else if (typeN === "NodeRemoveVariables") {
        newNode.data = { list: [] };
      } else if (typeN === "NodeReply") {
        newNode.data = {
          timeout: { value: 30, type: ["MINUTES"] },
          list: [],
        };
      } else if (typeN === "NodeSendFiles") {
        newNode.data = { files: [] };
      } else if (typeN === "NodeSwitchVariable") {
        newNode.data = { values: [], preview: [] };
      } else if (typeN === "NodeTimer") {
        newNode.data = { value: 20, type: ["seconds"] };
      } else if (typeN === "NodeRemoveTags") {
        newNode.data = { list: [] };
      } else if (typeN === "NodeUpdateTrelloCard") {
        newNode.data = { fields: [] };
      }
      onNodesChange([{ type: "add", item: newNode }]);
      setTypeDrag(null);
    },
    [screenToFlowPosition, typeDrag]
  );

  useEffect(() => {
    if (!changes.nodes.length && !changes.edges.length) return;

    const timer = setTimeout(async () => {
      const nodesxx = await Promise.all(
        changes.nodes.map(async (n) => {
          if (n.type === "delete") {
            return { type: n.type, node: { id: n.id } };
          }
          const { position, type, deletable, preview, data } = nodes.find(
            (node) => node.id === n.id
          )!;
          return {
            type: n.type,
            node: {
              preview,
              position,
              type,
              id: n.id,
              deletable,
              data,
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
        id: props.id,
        body: { nodes: nodesxx, edges: edgesxx },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [changes.nodes, changes.edges, updateFlowData]);

  useEffect(() => {
    const handleKey = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        setLoad("load");

        if (!changes.nodes.length && !changes.edges.length) return;

        const nodesxx = await Promise.all(
          changes.nodes.map(async (n) => {
            if (n.type === "delete") {
              return { type: n.type, node: { id: n.id } };
            }
            const { position, type, deletable, preview, data } = nodes.find(
              (node) => node.id === n.id
            )!;
            return {
              type: n.type,
              node: { preview, position, type, id: n.id, deletable, data },
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
          id: props.id,
          body: { nodes: nodesxx, edges: edgesxx },
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changes]);

  return (
    <div className="reactflow-wrapper w-full h-full" ref={reactFlowWrapper}>
      {!viewReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Spinner
            borderWidth="2px"
            color="teal.500"
            size="md"
            className="-translate-y-20"
          />
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={() => setViewReady(true)}
        // snapToGrid={true}
        // snapGrid={[8, 8]}
        edgeTypes={edgeTypes}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        attributionPosition="top-right"
        // selectionMode={SelectionMode.Partial}
        // Garante que o retângulo não apareça sem modificador
        selectionOnDrag={false}
        // Desliga o retângulo de seleção (Shift + arrastar)
        selectionKeyCode={null}
        // Desliga o clique múltiplo (Ctrl/Cmd + clique)
        multiSelectionKeyCode={null}
        // Impede que o nó fique “selected” enquanto você o move
        // selectNodesOnDrag={false}
        // se quiser bloquear QUALQUER seleção (até simples)
        // elementsSelectable={false}
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
            padding: "10px 20px 10px 45px",
            pointerEvents: "none",
          }}
        >
          <HStack
            pointerEvents={"none"}
            justifyContent={"space-between"}
            w={"100%"}
          >
            <HStack className="w-full relative">
              <Presence
                animationName={{
                  _open: "slide-from-top, fade-in",
                }}
                animationDuration="moderate"
                present={isPending}
              >
                <Spinner color={"whiteAlpha.700"} />
              </Presence>
              <Presence
                animationName={{
                  _closed: "slide-to-top, fade-out",
                }}
                animationDuration="moderate"
                present={syncLoad === "save"}
              >
                <div className="flex select-none justify-end gap-x-2 text-white/70">
                  <RiSaveFill size={20} color="#78a5ec" />
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
                w={"full"}
                className="gap-x-2 text-red-500 flex items-center w-full"
              >
                <RiErrorWarningLine size={22} />
                <span className="text-base select-none">
                  Erro de sincronização! Se o erro persistir, contate o suporte.
                </span>
              </Presence>
            </HStack>
            <HStack className="pointer-events-auto">
              {/* <FeedbackComponent /> */}
              <SearchNodesComponents />
              {/* <ColorModeButton /> */}
            </HStack>
          </HStack>
        </Panel>
        <div
          style={{
            margin: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            padding: "10px 20px",
            zIndex: 9,
            cursor: "pointer",
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
            <span
              className="text-sm text-white/60 cursor-pointer"
              onClick={() => {}}
            >
              Pressione <strong className="text-white">CTRL</strong> +{" "}
              <strong className="text-white">S</strong> para salvar
            </span>
          </Presence>
        </div>
        <Panel
          position="bottom-center"
          style={{
            margin: 0,
            padding: "10px 20px",
            pointerEvents: "none",
          }}
        >
          <span className="block relative text-sm font-medium select-none">
            {props.flowData.name}
            {isSave && (
              <strong className="text-[#78a5ec] absolute -right-3 text-xl -top-2">
                *
              </strong>
            )}
          </span>
        </Panel>
        <Background color={colorDotFlow} gap={9} size={0.8} />
      </ReactFlow>
    </div>
  );
}

export function FlowBuilderPage() {
  const { logout } = useContext(AuthContext);
  const params = useParams<{ id: string }>();
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  const [flowData, setFlowData] = useState<{
    name: string;
    type: FlowType;
    businessIds: number[];
    nodes: any[];
    edges: any[];
  } | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsError(false);
    (async () => {
      try {
        const data = await getFlowData(params.id || "");
        setFlowData(data);
        setIsFetching(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          setIsError(true);
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();

    return () => {
      setFlowData(null);
      setIsFetching(true);
      setIsError(false);
    };
  }, [params.id]);

  const Toggle = useMemo(() => {
    return <div className="absolute top-4 left-2 z-20">{ToggleMenu}</div>;
  }, [ToggleMenu]);

  if (!params.id) {
    return (
      <div className="relative">
        {Toggle}
        <Presence
          animationName={{
            _open: "slide-from-top, fade-in",
            _closed: "slide-to-top, fade-out",
          }}
          animationDuration="moderate"
          present={true}
          position={"absolute"}
          top={0}
          left={0}
          zIndex={1}
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
      </div>
    );
  }

  return (
    <Box as={"div"} className="dndflow" h={"100svh"} position={"relative"}>
      {Toggle}
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
        zIndex={8}
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
        <Body id={params.id} flowData={structuredClone(flowData)} />
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
        zIndex={7}
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
