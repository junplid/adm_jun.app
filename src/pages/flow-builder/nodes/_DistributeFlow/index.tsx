import { Input } from "@chakra-ui/react";
import { useContext, useMemo } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { AiOutlineBranches } from "react-icons/ai";
import { FlowContext } from "../../../../contexts/flow.context";

type TypeDistributions = "sequential" | "random" | "balanced" | "intelligent";
const optionsDistributions = [
  { label: "Sequencial", value: "sequential" },
  { label: "Aleatório", value: "random" },
  // { label: "Balanceado", value: "balanced" },
  // { label: "Inteligente", value: "intelligent" },
];

interface DataNode {
  type: TypeDistributions;
  exits: {
    key: string;
    percentage?: number;
  }[];
}

export const NodeDistributeFlow: React.FC<Node> = ({ id }): JSX.Element => {
  const {
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);

  const { setNodes, setEdges } = useReactFlow();
  const store = useStoreApi();

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const remainingPorcetage = useMemo(() => {
    return Math.abs(
      data?.exits?.reduce((prev, crr) => prev + (crr.percentage ?? 0), 0) - 100
    );
  }, [data?.exits]);

  const isConnectable = useMemo(() => {
    if (startConnection) {
      if (startConnection.id === id) {
        return false;
      } else {
        if (
          !listIdNodesLineDependent.includes(id) &&
          !listLinesIdNodesInterruoption.includes(id)
        ) {
          return true;
        }

        if (listLinesIdNodesInterruoption.includes(startConnection.id)) {
          if (listIdNodesLineDependent.includes(id)) return false;
          return true;
        }
        if (listIdNodesLineDependent.includes(startConnection.id)) {
          if (listLinesIdNodesInterruoption.includes(id)) return false;
          return true;
        }
      }
    } else {
      return true;
    }
  }, [startConnection?.hash]);

  return (
    <PatternNode.PatternContainer
      size="180px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      header={{
        icon: AiOutlineBranches,
        label: "Distribuir fluxo",
        style: {
          bgColor: "#1a58de",
          color: "#ffffff",
        },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="flex flex-col gap-y-1 pt-3">
        <label className="flex w-full flex-col gap-0.5">
          <span style={{ fontSize: 9 }}>
            Tipo da distribuição
            <strong className="font-semibold text-red-500">*</strong>
          </span>
          <div className="nodrag flex w-full items-center gap-2">
            <SelectComponent
              styles={{
                valueContainer: {
                  paddingLeft: 9,
                },
                control: { minHeight: 20 },
                indicatorsContainer: { padding: 5 },
                dropdownIndicator: { padding: 3 },
              }}
              onChange={(propsV) =>
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        type: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              value={
                data.type
                  ? {
                      label:
                        optionsDistributions.find((v) => v.value === data.type)
                          ?.label ?? "",
                      value: data.type,
                    }
                  : undefined
              }
              options={optionsDistributions}
              isMulti={false}
              noOptionsMessage="Nenhum tipo encontrado"
              placeholder="Selecione o tipo"
            />
          </div>
        </label>
        <div className="my-1 flex flex-col gap-2">
          <ul className="space-y-1">
            {data.exits?.map((item) => (
              <li
                key={item.key}
                className="relative flex gap-1 bg-slate-200/10 p-1 pr-5"
              >
                <button
                  className="nodrag min-h-full cursor-pointer rounded-md bg-red-500 duration-200 hover:bg-red-600"
                  onClick={() => {
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const dataN: DataNode = node.data;
                          const newItems = dataN.exits.filter((i) => {
                            if (i.key !== item.key) return true;
                            setEdges((edges) =>
                              edges.filter(
                                ({ source, sourceHandle }) =>
                                  !(source === id && sourceHandle === i.key)
                              )
                            );
                            return false;
                          });

                          node.data = {
                            ...dataN,
                            exits: newItems,
                          } as DataNode;
                        }
                        return node;
                      });
                    });
                  }}
                >
                  <IoMdClose />
                </button>
                <div>
                  <div className="flex gap-x-1">
                    <span className="font-semibold tracking-wide">Saída:</span>
                    <span className="line-clamp-1 text-white/25">
                      {item.key}
                    </span>
                  </div>
                  {data.type === "balanced" && (
                    <div className="flex items-center gap-x-1">
                      <Input
                        focusBorderColor="#f6bb0b"
                        borderColor={"#2d3b55"}
                        size={"xs"}
                        maxWidth={"24"}
                        fontSize={10}
                        type="number"
                        min={0}
                        placeholder="Porcentagem*"
                        onChange={({ target }) => {
                          setNodes((nodes) => {
                            return nodes?.map((node) => {
                              if (node.id === id) {
                                const dataN: DataNode = node.data;
                                const nextState = dataN.exits.map((i) => {
                                  if (i.key === item.key) {
                                    if (
                                      remainingPorcetage ||
                                      Number(target.value) <
                                        (i.percentage as number)
                                    ) {
                                      i.percentage = Number(target.value);
                                    }
                                  }
                                  return i;
                                });

                                node.data = {
                                  ...dataN,
                                  exits: nextState,
                                } as DataNode;
                              }
                              return node;
                            });
                          });
                        }}
                        value={item.percentage ?? "0"}
                      />
                      <strong>%</strong>
                    </div>
                  )}
                </div>
                <CustomHandle
                  handleId={item.key}
                  nodeId={id}
                  type="source"
                  position={Position.Right}
                  style={{ right: -25, top: "50%" }}
                  isConnectable
                />
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    if (
                      dataN?.exits === undefined ||
                      dataN?.exits?.length <= 30
                    ) {
                      node.data = {
                        ...dataN,
                        ...(dataN.exits?.length
                          ? { exits: [...data.exits, { key: nanoid() }] }
                          : { exits: [{ key: nanoid() }] }),
                      } as DataNode;
                    }
                  }
                  return node;
                });
              });
            }}
            className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
          >
            <span>Adicionar caminho {data.exits?.length ?? 0}/30</span>
            <IoMdAdd size={14} />
          </button>
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          position={Position.Left}
          style={{ top: "30%", left: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
