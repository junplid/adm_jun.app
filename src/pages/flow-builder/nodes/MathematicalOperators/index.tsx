import { Button, Radio, RadioGroup, Textarea } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineCalculator, AiOutlineDelete } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";

type DataNode = {
  aggregation: (
    | {
        key: string;
        type: "mathematics";
        formula: string;
        run?: {
          passToInt?: boolean;
          passToAbsolute?: boolean;
        };
      }
    | {
        key: string;

        type: "date";
        formula: string;
        run?: {
          passToAbsolute?: boolean;
          passToInt?: boolean;
          workingDays?: boolean;
          pick?: "day" | "month" | "year";
          transformDateIntoDay?: boolean;
        };
      }
  )[];
  variableId: number;
};

export const NodeMathematicalOperators: React.FC<Node> = ({
  id,
}): JSX.Element => {
  const {
    options,
    actions: { createVariable, getVariables },
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  const [loadCreateVariable, setLoadCreateVariable] = useState<boolean>(false);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.variables.length && isFirst) {
      getVariables();
      setIsFirst(true);
    }
  }, [options.variables.length, isFirst]);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

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
      size="230px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineCalculator,
        label: "Operadores matemáticos/data",
        style: {
          bgColor: "#1a58de",
          color: "#fff",
        },
      }}
    >
      <div className="nopan flex flex-col gap-y-3 px-1 pb-1 pt-2">
        <a
          href="https://www.youtube.com"
          target="_blank"
          className="text-blue-400 underline duration-200 hover:text-blue-100"
        >
          Clique aqui para ver o tutorial de como usar este bloco
        </a>
        <div className="flex flex-col gap-y-2">
          <ul className="flex flex-col gap-y-2">
            {!data.aggregation ? (
              <li>
                <p style={{ fontSize: 9 }}>
                  Nesse bloco poderá ser realizado operações matemáticas e o
                  valor ficará armazenado na variavel dafinida abaixo
                </p>
              </li>
            ) : (
              data.aggregation?.map((aggregationItem) => (
                <li key={aggregationItem.key} className="flex gap-x-2">
                  <button
                    className="nodrag min-h-full cursor-pointer rounded-md bg-red-500 px-1 duration-200 hover:bg-red-600"
                    onClick={() => {
                      setNodes((nodes) => {
                        return nodes?.map((node) => {
                          if (node.id === id) {
                            const dataN: DataNode = node.data;
                            const newItems = dataN.aggregation.filter(
                              (a) => a.key !== aggregationItem.key
                            );
                            node.data = {
                              ...dataN,
                              aggregation: newItems,
                            } as DataNode;
                          }
                          return node;
                        });
                      });
                    }}
                  >
                    <AiOutlineDelete size={13} />
                  </button>
                  <div className="flex flex-col gap-y-2">
                    <RadioGroup value={aggregationItem.type}>
                      <div className="flex items-center justify-center gap-2">
                        <label className="flex gap-x-1 px-1">
                          <Radio
                            size={"sm"}
                            colorScheme="green"
                            value="mathematics"
                            onChange={() => {
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    const nextStateAggregation =
                                      dataN.aggregation.map((agg) => {
                                        if (agg.key === aggregationItem.key) {
                                          agg.type = "mathematics";
                                        }
                                        return agg;
                                      });
                                    node.data = {
                                      ...dataN,
                                      aggregation: nextStateAggregation,
                                    } as DataNode;
                                  }
                                  return node;
                                })
                              );
                            }}
                          />
                          <span>Matemática</span>
                        </label>
                        <label className="flex gap-x-1 px-1">
                          <Radio
                            size={"sm"}
                            value="date"
                            disabled
                            isDisabled
                            colorScheme="green"
                            onChange={() => {
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    const nextStateAggregation =
                                      dataN.aggregation.map((agg) => {
                                        if (agg.key === aggregationItem.key) {
                                          agg.type = "date";
                                        }
                                        return agg;
                                      });
                                    node.data = {
                                      ...dataN,
                                      aggregation: nextStateAggregation,
                                    } as DataNode;
                                  }
                                  return node;
                                })
                              );
                            }}
                          />
                          <span>Data</span>
                        </label>
                      </div>
                    </RadioGroup>
                    <Textarea
                      focusBorderColor="#f6bb0b"
                      borderColor={"#1a4246"}
                      resize={"none"}
                      className="nodrag"
                      padding={"2"}
                      style={{
                        boxShadow: "0 1px 1px #0707071d",
                        fontSize: 10,
                        background: "#1a4246",
                      }}
                      value={aggregationItem.formula ?? ""}
                      onChange={({ target }) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              const nextStateAggregation =
                                dataN.aggregation.map((agg) => {
                                  if (agg.key === aggregationItem.key) {
                                    agg.formula = target.value;
                                  }
                                  return agg;
                                });
                              node.data = {
                                ...dataN,
                                aggregation: nextStateAggregation,
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                      onInput={({ target }) => {
                        //@ts-expect-error
                        target.style.height = "auto";
                        //@ts-expect-error
                        target.style.height = target.scrollHeight + 2 + "px";
                      }}
                      placeholder="Sua fórmula f(x)"
                    />
                  </div>
                </li>
              ))
            )}
          </ul>

          {!data.aggregation?.length && (
            <button
              onClick={() => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;
                      node.data = {
                        ...dataN,
                        ...(dataN.aggregation
                          ? {
                              aggregation: [
                                ...dataN.aggregation,
                                {
                                  key: nanoid(),
                                  type: "mathematics",
                                  formula: "",
                                },
                              ],
                            }
                          : {
                              aggregation: [
                                {
                                  key: nanoid(),
                                  type: "mathematics",
                                  formula: "",
                                },
                              ],
                            }),
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
              className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
            >
              <span>Adicionar operação</span>
              <IoMdAdd size={14} />
            </button>
          )}

          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione a variável que receberá o resultado
              <strong className="font-semibold text-red-500">*</strong>
            </span>
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
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        variableId: Number(propsV.value),
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              buttonEmpityOnSubmitNewItem={({ value }) => (
                <Button
                  type="button"
                  colorScheme="green"
                  onClick={async () => {
                    setLoadCreateVariable(true);
                    await createVariable(value);
                    setLoadCreateVariable(false);
                  }}
                  isLoading={loadCreateVariable}
                >
                  <span style={{ fontSize: 11 }}>Criar nova variável</span>
                </Button>
              )}
              options={options.variables.map((v) => ({
                label: v.name,
                value: v.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhuma variável encontrada"
              placeholder="Selecione a variável*"
              value={
                data.variableId
                  ? {
                      label:
                        options.variables.find((v) => v.id === data.variableId)
                          ?.name ?? "",
                      value: Number(data.variableId),
                    }
                  : undefined
              }
            />
          </label>
        </div>

        <CustomHandle
          handleId={"main"}
          nodeId={id}
          type="source"
          position={Position.Right}
          style={{ top: "50%", right: -15 }}
          isConnectable={isConnectable}
        />

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
