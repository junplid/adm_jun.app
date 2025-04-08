import { useContext, useEffect, useMemo, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AiOutlineSwitcher } from "react-icons/ai";

const optionsTypeSwitch = [
  { label: "Tags / Etiquetas", value: "tag" },
  { label: "Variável", value: "variable" },
];

type DataNode =
  | {
      type: "tag";
      possibleTags: { value: string; tagId: number; key: string }[];
    }
  | {
      type: "variable";
      variableId: number;
      possibleValues: { value: string; key: string }[];
    };

export const NodeSwitch: React.FC<Node> = ({ id }): JSX.Element => {
  const {
    options,
    actions,
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

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) return;
    if (!options.variables.length) {
      actions.getVariables();
    }
    if (!options.tags.length) {
      actions.getTags("contactwa");
    }
    setIsFirst(true);
  }, [options.variables.length, options.tags.length, isFirst]);

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
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineSwitcher,
        label: "Switch",
        style: { bgColor: "#1a58de", color: "#fff" },
      }}
    >
      <div className="nopan flex flex-col gap-y-3 px-1 pb-1 pt-2">
        <div className="flex flex-col gap-y-2">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o tipo da condição
            </span>
            <SelectComponent
              styles={{
                valueContainer: { paddingLeft: 9 },
                control: { minHeight: 20 },
                indicatorsContainer: { padding: 5 },
                dropdownIndicator: { padding: 3 },
              }}
              onChange={(propsV) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        type: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
                const edgesVarKey =
                  data.type === "variable"
                    ? data.possibleValues.map((v) => v.key)
                    : [];
                const edgesTagKey =
                  data.type === "tag"
                    ? data.possibleTags.map((t) => t.key)
                    : [];
                const allEdgesHandles = [...edgesTagKey, ...edgesVarKey];

                setEdges((edges) =>
                  edges.filter(
                    ({ source, sourceHandle }) =>
                      !(
                        source === id &&
                        allEdgesHandles.some((all) => all === sourceHandle)
                      )
                  )
                );
              }}
              options={optionsTypeSwitch}
              isMulti={false}
              noOptionsMessage="Nenhuma tipo encontrado"
              placeholder="Selecione o tipo*"
              value={
                data.type
                  ? {
                      label:
                        optionsTypeSwitch.find((v) => v.value === data.type)
                          ?.label ?? "",
                      value: data.type,
                    }
                  : undefined
              }
            />
          </label>

          {data?.type === "tag" && (
            <div className="flex flex-col gap-y-1">
              <div className="my-1 flex flex-col gap-y-3">
                {data?.possibleTags?.length ? (
                  <div className="flex flex-col gap-y-1">
                    <span className="font-semibold text-white/70">
                      Possíveis Tags/Etiquetas:
                    </span>
                    {
                      <ul className="space-y-1">
                        {data?.possibleTags?.map((item) => (
                          <li
                            key={item.key}
                            className="relative flex gap-1 bg-slate-200/10 p-1 pr-5"
                          >
                            <button
                              className="nodrag min-h-full cursor-pointer bg-red-500 duration-200 hover:bg-red-600"
                              onClick={() => {
                                setNodes((nodes) => {
                                  return nodes?.map((node) => {
                                    if (node.id === id) {
                                      const dataN: DataNode = node.data;
                                      const newItems = data.possibleTags.filter(
                                        (i) => {
                                          if (i.key !== item.key) return true;
                                          setEdges((edges) =>
                                            edges.filter(
                                              ({ source, sourceHandle }) =>
                                                !(
                                                  source === id &&
                                                  sourceHandle === i.key
                                                )
                                            )
                                          );
                                          return false;
                                        }
                                      );

                                      node.data = {
                                        ...dataN,
                                        possibleTags: newItems,
                                      } as DataNode;
                                    }
                                    return node;
                                  });
                                });
                              }}
                            >
                              <IoMdClose />
                            </button>
                            <span>{item.value}</span>
                            <CustomHandle
                              handleId={item.key}
                              nodeId={id}
                              type="source"
                              position={Position.Right}
                              style={{ right: -29, top: "50%" }}
                              isConnectable={isConnectable}
                            />
                          </li>
                        ))}
                      </ul>
                    }
                  </div>
                ) : undefined}
                <label className="nodrag flex flex-col gap-y-1">
                  <span className="font-semibold text-white/80">
                    Selecione as possíveis tags/etiquetas
                  </span>
                  <SelectComponent
                    styles={{
                      valueContainer: { paddingLeft: 9 },
                      control: { minHeight: 20 },
                      indicatorsContainer: { padding: 5 },
                      dropdownIndicator: { padding: 3 },
                    }}
                    onChange={(propsV) => {
                      const possibleTags = data.possibleTags?.length
                        ? [
                            ...data.possibleTags,
                            {
                              key: nanoid(),
                              tagId: Number(propsV.value),
                              value: propsV.label,
                            },
                          ]
                        : [
                            {
                              key: nanoid(),
                              tagId: Number(propsV.value),
                              value: propsV.label,
                            },
                          ];
                      setNodes((nodes) =>
                        nodes.map((node) => {
                          if (node.id === id) {
                            node.data = {
                              ...data,
                              possibleTags,
                            } as DataNode;
                          }
                          return node;
                        })
                      );
                    }}
                    options={options.tags
                      .filter(
                        (tp) =>
                          !data.possibleTags?.some((pt) => pt.tagId === tp.id)
                      )
                      .map((tps) => {
                        return {
                          label: tps.name,
                          value: tps.id,
                        };
                      })}
                    value={{
                      label: "Selecione...",
                      value: "",
                    }}
                    isMulti={false}
                    noOptionsMessage="Nenhuma tipo encontrado"
                    placeholder="Selecione o tipo*"
                  />
                </label>
              </div>
            </div>
          )}

          {data?.type === "variable" && (
            <div className="flex flex-col gap-y-1">
              <label className="nodrag flex flex-col gap-y-1">
                <span className="font-semibold text-white/80">
                  Selecione a variável
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
                          };
                        }
                        return node;
                      })
                    )
                  }
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
                            options.variables.find(
                              (v) => v.id === data.variableId
                            )?.name ?? "",
                          value: Number(data.variableId),
                        }
                      : undefined
                  }
                />
              </label>
              <div className="my-1 flex flex-col gap-y-3">
                {data?.possibleValues?.length ? (
                  <div className="flex flex-col gap-y-1">
                    <span className="font-semibold text-white/70">
                      Possíveis valores:
                    </span>
                    <ul className="space-y-1">
                      {data?.possibleValues?.map((item) => (
                        <li
                          key={item.key}
                          className="relative flex gap-1 bg-slate-200/10 p-1 pr-5"
                        >
                          <button
                            className="nodrag min-h-full cursor-pointer bg-red-500 duration-200 hover:bg-red-600"
                            onClick={() => {
                              setNodes((nodes) => {
                                return nodes?.map((node) => {
                                  if (node.id === id) {
                                    const dataN: DataNode = node.data;
                                    const newItems = data.possibleValues.filter(
                                      (i) => {
                                        if (i.key !== item.key) return true;
                                        setEdges((edges) =>
                                          edges.filter(
                                            ({ source, sourceHandle }) =>
                                              !(
                                                source === id &&
                                                sourceHandle === i.key
                                              )
                                          )
                                        );
                                        return false;
                                      }
                                    );

                                    node.data = {
                                      ...dataN,
                                      possibleValues: newItems,
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
                            <input
                              type="text"
                              className="w-full border-none bg-transparent font-semibold text-white outline-none placeholder:font-normal placeholder:text-white"
                              placeholder="Digite o valor esperado"
                              value={item.value ?? ""}
                              onChange={({ target }) => {
                                setNodes((nodes) => {
                                  return nodes?.map((node) => {
                                    if (node.id === id) {
                                      const newItems = data.possibleValues.map(
                                        (psv) => {
                                          if (psv.key === item.key) {
                                            psv.value = target.value;
                                          }
                                          return psv;
                                        }
                                      );

                                      node.data = {
                                        ...data,
                                        possibleValues: newItems,
                                      } as DataNode;
                                    }
                                    return node;
                                  });
                                });
                              }}
                            />
                          </div>
                          <CustomHandle
                            handleId={item.key}
                            nodeId={id}
                            type="source"
                            position={Position.Right}
                            style={{ right: -29, top: "50%" }}
                            isConnectable={isConnectable}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : undefined}
                <button
                  onClick={() => {
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const key = nanoid();
                          const possibleValues = data.possibleValues?.length
                            ? [...data.possibleValues, { key, value: "" }]
                            : [{ key, value: "" }];

                          node.data = { ...data, possibleValues } as DataNode;
                        }
                        return node;
                      });
                    });
                  }}
                  className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
                >
                  <span>Adicionar possível valor</span>
                  <IoMdAdd size={14} />
                </button>
              </div>
            </div>
          )}

          {(data?.type === "variable" || data.type === "tag") && (
            <div className="relative bg-red-500/50 p-1">
              <span>Caso todos estejam incorretos</span>
              <CustomHandle
                handleId={"red case_none"}
                nodeId={id}
                type="source"
                position={Position.Right}
                style={{ right: -29, top: "50%", background: "red" }}
                isConnectable={isConnectable}
              />
            </div>
          )}
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          position={Position.Left}
          style={{ top: "30%" }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
