import { Button, Checkbox, Input, Textarea } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { CustomHandle } from "";
import { PatternNode } from "../Pattern";
import { v4 } from "uuid";
import { AiOutlineApi, AiOutlineDelete } from "react-icons/ai";
import SelectComponent from "../../../../components/Select";
import { FlowContext } from "../../../../contexts/flow.context";

type TypeMethods = "get" | "post" | "put" | "delete";

const optionsMethods = [
  { label: "GET", value: "get" },
  { label: "POST", value: "post" },
  { label: "PUT", value: "put" },
  { label: "DELETE", value: "delete" },
];

interface DataNode {
  method: "get" | "post" | "put" | "delete";
  url: string;
  isHeaders: boolean;
  isBody?: boolean;
  body?: string;
  headers: { key: string; value: string; id: string }[];
  variableId?: number;
}

export const NodeWebhook: React.FC<Node> = ({ id }) => {
  const {
    options,
    actions,
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [loadCreateVariable, setLoadCreateVariable] = useState(false);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  useEffect(() => {
    if (!data.method) {
      setNodes((nodes) =>
        nodes.map((node) => {
          const dataN: DataNode = node.data;
          if (node.id === id) {
            node.data = {
              ...dataN,
              method: "get" as TypeMethods,
              headers: data.headers?.length ? data.headers : [],
            } as DataNode;
          }
          return node;
        })
      );
    }
  }, []);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.variables.length && isFirst) {
      actions.getVariables("dynamics");
      setIsFirst(true);
    }
  }, [options.variables.length, isFirst]);

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
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineApi,
        label: "Webhook",
        style: { bgColor: "#ad073c", color: "#ffffff" },
      }}
      size="225px"
    >
      <div className="flex flex-col gap-y-3 py-2 pb-1">
        <div className="mt-2 flex flex-col gap-1">
          <span>Configure sua requisição</span>
          <div className="flex items-center gap-x-2">
            <select
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        method: target.value as TypeMethods,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              value={data.method}
              className="nodrag bg-gray-700 py-1 text-xs"
            >
              {optionsMethods.map(({ label, value }) => (
                <option value={value}>{label}</option>
              ))}
            </select>
            <label className="nodrag">
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#2d3b55"}
                size={"xs"}
                fontSize={10}
                placeholder="https://suaapi.com/"
                onChange={({ target }) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          url: target.value,
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                value={data.url ?? ""}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <Checkbox
            isChecked={data.isHeaders}
            onChange={({ target }) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = {
                      ...dataN,
                      isHeaders: target.checked,
                      headers: target.checked
                        ? [...dataN.headers, { id: v4() }]
                        : [],
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
            size={"sm"}
          >
            <span style={{ fontSize: 10 }}>Auth ou autorização</span>
          </Checkbox>
          {data.isHeaders && (
            <div className="flex flex-col items-center gap-y-2">
              <ul className="flex flex-col gap-y-2">
                {data.headers?.map(({ id: headerId, ...rest }) => (
                  <li key={headerId} className="flex gap-1">
                    <Input
                      focusBorderColor="#f6bb0b"
                      borderColor={"#2d3b55"}
                      size={"xs"}
                      fontSize={10}
                      placeholder="Chave"
                      onChange={({ target }) => {
                        setNodes((nodes) => {
                          return nodes?.map((node) => {
                            if (node.id === id) {
                              const dataN: DataNode = node.data;
                              node.data = {
                                ...dataN,
                                headers: dataN.headers.map((s) => {
                                  if (s.id === headerId) s.key = target.value;
                                  return s;
                                }),
                              } as DataNode;
                            }
                            return node;
                          });
                        });
                      }}
                      value={rest.key ?? ""}
                    />
                    <Input
                      focusBorderColor="#f6bb0b"
                      borderColor={"#2d3b55"}
                      size={"xs"}
                      fontSize={10}
                      placeholder="Valor"
                      onChange={({ target }) => {
                        setNodes((nodes) => {
                          return nodes?.map((node) => {
                            if (node.id === id) {
                              const dataN: DataNode = node.data;
                              node.data = {
                                ...dataN,
                                headers: dataN.headers.map((s) => {
                                  if (s.id === headerId) s.value = target.value;
                                  return s;
                                }),
                              } as DataNode;
                            }
                            return node;
                          });
                        });
                      }}
                      value={rest.value ?? ""}
                    />
                    <a
                      onClick={() => {
                        setNodes((nodes) => {
                          return nodes?.map((node) => {
                            if (node.id === id) {
                              const dataN: DataNode = node.data;
                              node.data = {
                                ...dataN,
                                headers: dataN.headers.filter(
                                  (s) => s.id !== headerId
                                ),
                              } as DataNode;
                            }
                            return node;
                          });
                        });
                      }}
                      className="nodrag flex cursor-pointer items-center justify-center text-white duration-200 hover:text-red-400"
                    >
                      <AiOutlineDelete size={16} />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                onClick={() => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          headers: [...dataN.headers, { id: v4() }],
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                className="nodrag cursor-pointer text-white/70 duration-200 hover:text-white"
              >
                + Adicionar cabeçalho
              </a>
            </div>
          )}
        </div>

        {data.method !== "get" && (
          <div>
            <Checkbox
              isChecked={data.isBody}
              onChange={({ target }) => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;
                      node.data = {
                        ...dataN,
                        isBody: target.checked,
                        body: target.checked
                          ? '{\n    suaChave1: "VALOR"\n    suaChave2: "VALOR"\n}'
                          : undefined,
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
              size={"sm"}
            >
              <span style={{ fontSize: 10 }}>Enviar o corpo do requisição</span>
            </Checkbox>
            {data.isBody && (
              <Textarea
                focusBorderColor={"#f6bb0b"}
                borderColor={"#1a4246"}
                name={"body"}
                className="nodrag"
                autoComplete={"off"}
                value={
                  data.body ||
                  '{\n    suaChave1: "VALOR"\n    suaChave2: "VALOR"\n}'
                }
                rows={4}
                style={{
                  boxShadow: "0 1px 1px #0707071d",
                  fontSize: 10,
                  background: "#1a4246",
                }}
                resize="none"
                onInput={({ target }) => {
                  //@ts-expect-error
                  target.style.height = "auto";
                  //@ts-expect-error
                  target.style.height = target.scrollHeight + 2 + "px";
                }}
                onChange={({ target }) => {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      const dataN: DataNode = node.data;
                      if (node.id === id) {
                        node.data = {
                          ...dataN,
                          body: target.value,
                        } as DataNode;
                      }
                      return node;
                    })
                  );
                }}
                padding={"2"}
                paddingLeft={"2"}
              />
            )}
          </div>
        )}

        <label className="nodrag flex flex-col gap-y-1">
          <span className="text-white/80">
            Você pode salvar a informação da resposta da requisição em uma
            variavel
          </span>
          <SelectComponent
            styles={{
              valueContainer: { paddingLeft: 9 },
              control: { minHeight: 20 },
              indicatorsContainer: { padding: 5 },
              dropdownIndicator: { padding: 3 },
            }}
            onChange={(propsV) => {
              console.log(propsV);
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
              );
            }}
            buttonEmpityOnSubmitNewItem={({ value }) => (
              <Button
                type="button"
                colorScheme="green"
                onClick={async () => {
                  setLoadCreateVariable(true);
                  await actions.createVariable(value);
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
            placeholder="Selecione"
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

        <Handle
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          type="target"
          position={Position.Left}
          style={{ left: -15 }}
        />
        <CustomHandle
          nodeId={id}
          handleId={"main"}
          isConnectable={isConnectable}
          type="source"
          position={Position.Right}
          style={{ right: -15 }}
        />
        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
