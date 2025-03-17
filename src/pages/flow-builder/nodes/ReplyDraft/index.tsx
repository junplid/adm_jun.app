import { Button, Checkbox, Input, Radio, RadioGroup } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useCollapse } from "react-collapsed";
import { AiOutlineFieldTime, AiOutlineMessage } from "react-icons/ai";
import { FiAlertTriangle } from "react-icons/fi";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import TextareaAutosize from "react-textarea-autosize";
import { Handle, Node, Position, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";

const optionsValidateTime = [
  { label: "Minutos", value: "MINUTES" },
  { label: "Horas", value: "HOURS" },
  { label: "Dias", value: "DAYS" },
];

type TypeActions = "SUBMIT_FLOW" | "FORK" | "CONTINUE" | "END_FLOW";

interface DataNode {
  isSaveReply: boolean;
  variableId: number;
  timeOut?: {
    type: "MINUTES" | "HOURS" | "DAYS";
    value: number;
    action?: {
      interval: number;
      value: string;
      run: TypeActions;
      submitFlowId?: number;
    };
  };
}

export const NodeReply: React.FC<Node> = ({ id }): JSX.Element => {
  const {
    options,
    actions,
    reactflow: {
      setNodes,
      setEdges,
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const store = useStoreApi();

  const [loadCreateVariable, setLoadCreateVariable] = useState<boolean>(false);
  const [hTextATimeout, setHTextATimeout] = useState<number>(0);
  const {
    getCollapseProps: getCollapsePropsTimeout,
    getToggleProps: getTogglePropsTimeout,
    isExpanded: isExpandedTimeout,
  } = useCollapse();

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const positionTopCustomHandleTimeout = useMemo(() => {
    let p = 0;
    if (data.isSaveReply) {
      p = p - 15;
      if (isExpandedTimeout) {
        p = p + 255;
        if (hTextATimeout) p = p + hTextATimeout - 17.5;
      }
    } else {
      p = p - 15;
      if (isExpandedTimeout) p = 219 + hTextATimeout;
    }
    return p;
  }, [hTextATimeout, isExpandedTimeout, data.isSaveReply]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.variables.length && isFirst && data.isSaveReply) {
      actions.getVariables("dynamics");
      setIsFirst(true);
    }
  }, [options.variables.length, isFirst, data.isSaveReply]);

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
      header={{
        icon: AiOutlineMessage,
        label: "Receber resposta",
        style: { bgColor: "#09900b", color: "#ffffff" },
      }}
      isConnectable={isConnectable}
    >
      <div className="nopan flex flex-col gap-y-2 px-1 pb-1">
        <div className="flex flex-col gap-y-2 pt-3">
          <label className="flex gap-x-2">
            <Checkbox
              size={"sm"}
              colorScheme="green"
              isChecked={data?.isSaveReply ?? false}
              onChange={({ target }) => {
                if (target.checked) {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      const dataN: DataNode = node.data;
                      if (node.id === id) {
                        node.data = {
                          ...dataN,
                          isSaveReply: target.checked,
                        } as DataNode;
                      }
                      return node;
                    })
                  );
                } else {
                  setEdges((eds) =>
                    eds.filter(
                      (e) =>
                        !(e.sourceHandle === "red timeOut" && e.source !== id)
                    )
                  );
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = {
                          timeOut: node.data.timeOut,
                          isSaveReply: target.checked,
                        };
                      }
                      return node;
                    })
                  );
                }
              }}
            />
            <span>Salvar resposta em uma variável</span>
          </label>
        </div>
        {!data.isSaveReply && (
          <div className="flex gap-1 bg-yellow-600/60 p-1">
            <FiAlertTriangle size={18} />
            <span className=" text-white/90">
              O bot esperará uma mensagem do lead para passar para o bloco
              seguinte
            </span>
          </div>
        )}
        {data.isSaveReply && (
          <div className="flex flex-col">
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione a variável
                <strong className="text-red-500">*</strong>
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
                          options.variables.find(
                            (v) => v.id === data.variableId
                          )?.name ?? "",
                        value: Number(data.variableId),
                      }
                    : undefined
                }
              />
            </label>
          </div>
        )}

        <div className="flex flex-col border-t border-white/20 pt-3">
          <button
            className={`timeout-${id} flex w-full items-center justify-between pb-2`}
            {...getTogglePropsTimeout()}
            style={{ fontSize: 11 }}
          >
            <span className="text-start font-semibold">
              - Tempo de expiração
            </span>
            {isExpandedTimeout ? (
              <IoChevronUpOutline size={14} />
            ) : (
              <IoChevronDownOutline size={14} />
            )}
          </button>

          <div className="relative">
            <CustomHandle
              nodeId={id}
              handleId="red timeOut"
              type="source"
              position={Position.Right}
              style={{
                right: -29,
                background: "red",
                transition: "210ms ease",
                top: positionTopCustomHandleTimeout,
              }}
              isConnectable={
                isConnectable ? data.timeOut?.action?.run === "FORK" : false
              }
            />
            <div {...getCollapsePropsTimeout()}>
              <div
                className="flex flex-col bg-slate-800/50"
                style={{
                  paddingBottom: 7,
                }}
              >
                <i className="block p-2 text-white/90">
                  Se não houver resposta após um certo período, envie uma
                  mensagem e tome uma decisão
                </i>
                <div className="my-2 flex flex-col gap-y-2 px-2">
                  <div className="flex w-full justify-between gap-1">
                    <label className="flex w-full flex-col gap-0.5">
                      <span style={{ fontSize: 9 }}>Tipo</span>
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
                                    timeOut: {
                                      ...dataN.timeOut,
                                      type: propsV.value,
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            )
                          }
                          value={
                            data?.timeOut?.type
                              ? {
                                  label:
                                    optionsValidateTime.find(
                                      (v) => v.value === data?.timeOut?.type
                                    )?.label ?? "",
                                  value: data?.timeOut?.type,
                                }
                              : undefined
                          }
                          options={optionsValidateTime}
                          isMulti={false}
                          noOptionsMessage="Nenhum tipo encontrado"
                          placeholder="Selecione*"
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span style={{ fontSize: 9 }}>Quantidade</span>
                      <div className="flex items-center gap-2">
                        <Input
                          focusBorderColor="#f6bb0b"
                          borderColor={"#354564"}
                          size={"sm"}
                          type="number"
                          min={1}
                          style={{
                            height: 38,
                            width: 70,
                          }}
                          fontSize={10}
                          title={`${data.timeOut?.value ?? 1} Segundos`}
                          value={data.timeOut?.value ?? "1"}
                          onChange={({ target }) => {
                            setNodes((nodes) =>
                              nodes.map((node) => {
                                const dataN: DataNode = node.data;
                                if (node.id === id) {
                                  node.data = {
                                    ...dataN,
                                    timeOut: {
                                      ...dataN?.timeOut,
                                      value: Number(target.value),
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                        />
                      </div>
                    </label>
                  </div>
                  <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2 py-1">
                    <span style={{ fontSize: 9 }}>Digitando...</span>
                    <div className="flex items-center gap-2">
                      <Input
                        focusBorderColor="#f6bb0b"
                        borderColor={"#354564"}
                        size={"xs"}
                        width={"14"}
                        type="number"
                        min={2}
                        fontSize={10}
                        title={`${
                          data?.timeOut?.action?.interval ?? 2
                        } Segundos`}
                        value={data?.timeOut?.action?.interval ?? "2"}
                        onChange={({ target }) => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  timeOut: {
                                    ...dataN?.timeOut,
                                    action: {
                                      ...dataN?.timeOut?.action,
                                      interval:
                                        Number(target.value) <= 1
                                          ? 2
                                          : Number(target.value),
                                    },
                                  },
                                } as DataNode;
                              }
                              return node;
                            })
                          );
                        }}
                      />
                      <AiOutlineFieldTime size={18} />
                    </div>
                  </label>
                  <div className="grid h-full flex-1 items-center">
                    <AutoCompleteTextarea
                      textareaProps={{
                        className:
                          "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                        rows: 1,
                        maxRows: 8,
                        style: {
                          boxShadow: "0 1px 1px #0707071d",
                          fontSize: 10,
                          background: "#131a27",
                          resize: "none",
                          border: "#34425a",
                        },
                        as: TextareaAutosize,
                        onHeightChange: (n: number) => setHTextATimeout(n),
                      }}
                      setValue={(value) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              node.data = {
                                ...dataN,
                                timeOut: {
                                  ...dataN?.timeOut,
                                  action: {
                                    ...dataN?.timeOut?.action,
                                    value,
                                  },
                                },
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                      placeholder="Digite a mensagem aqui"
                      value={data?.timeOut?.action?.value ?? ""}
                      tokens={{
                        "{{": {
                          getOptions: actions.getVariablesReturnValues,
                        },
                      }}
                    />
                  </div>
                </div>
                <RadioGroup>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col gap-y-2 px-2">
                      <label className="flex gap-x-2">
                        <Radio
                          size={"sm"}
                          colorScheme="green"
                          isChecked={
                            data?.timeOut?.action?.run === "SUBMIT_FLOW"
                          }
                          onChange={() => {
                            setEdges((edges) =>
                              edges.filter(
                                ({ source, sourceHandle }) =>
                                  !(source === id && sourceHandle === "timeOut")
                              )
                            );
                            setNodes((nodes) =>
                              nodes.map((node) => {
                                const dataN: DataNode = node.data;
                                if (node.id === id) {
                                  node.data = {
                                    ...dataN,
                                    timeOut: {
                                      ...dataN?.timeOut,
                                      action: {
                                        ...dataN?.timeOut?.action,
                                        run: "SUBMIT_FLOW",
                                      },
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                        />
                        <span>Enviar fluxo</span>
                      </label>
                      {data?.timeOut?.action?.run === "SUBMIT_FLOW" && (
                        <div className="nodrag mt-0.5 px-2">
                          <SelectComponent
                            styles={{
                              valueContainer: {
                                paddingLeft: 9,
                              },
                              control: { minHeight: 20 },
                              indicatorsContainer: { padding: 5 },
                              dropdownIndicator: { padding: 3 },
                            }}
                            onChange={(propsV) => {
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    node.data = {
                                      ...node.data,
                                      timeOut: {
                                        ...dataN?.timeOut,
                                        action: {
                                          ...dataN?.timeOut?.action,
                                          submitFlowId: Number(propsV.value),
                                        },
                                      },
                                    } as DataNode;
                                  }
                                  return node;
                                })
                              );
                            }}
                            value={
                              data?.timeOut?.action?.submitFlowId
                                ? {
                                    label:
                                      options.flows.find(
                                        (v) =>
                                          Number(v.id) ===
                                          data?.timeOut?.action?.submitFlowId
                                      )?.name ?? "",
                                    value: data?.timeOut?.action?.submitFlowId,
                                  }
                                : undefined
                            }
                            options={options.flows.map((f) => ({
                              label: f.name,
                              value: f.id,
                            }))}
                            isMulti={false}
                            noOptionsMessage="Nenhum fluxo encontrado"
                            placeholder="Selecione o fluxo"
                          />
                        </div>
                      )}
                    </div>
                    <label className="relative cursor-pointer bg-orange-500/25 p-2">
                      <div className="flex gap-x-2">
                        <Radio
                          size={"sm"}
                          colorScheme="green"
                          isChecked={data?.timeOut?.action?.run === "FORK"}
                          onChange={() => {
                            setNodes((nodes) =>
                              nodes.map((node) => {
                                const dataN: DataNode = node.data;
                                if (node.id === id) {
                                  node.data = {
                                    ...dataN,
                                    timeOut: {
                                      ...dataN?.timeOut,
                                      action: {
                                        ...dataN?.timeOut?.action,
                                        run: "FORK",
                                      },
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                        />
                        <span>Caminho alternativo</span>
                      </div>
                    </label>
                    <label className="flex gap-x-2 px-2">
                      <Radio
                        size={"sm"}
                        colorScheme="green"
                        isChecked={data?.timeOut?.action?.run === "CONTINUE"}
                        onChange={() => {
                          setEdges((edges) =>
                            edges.filter(
                              ({ source, sourceHandle }) =>
                                !(source === id && sourceHandle === "timeOut")
                            )
                          );
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  timeOut: {
                                    ...dataN?.timeOut,
                                    action: {
                                      ...dataN?.timeOut?.action,
                                      run: "CONTINUE",
                                    },
                                  },
                                } as DataNode;
                              }
                              return node;
                            })
                          );
                        }}
                      />
                      <span>Continuar o fluxo</span>
                    </label>
                    <label className="flex gap-x-2 px-2">
                      <Radio
                        size={"sm"}
                        colorScheme="green"
                        isChecked={data?.timeOut?.action?.run === "END_FLOW"}
                        onChange={() => {
                          setEdges((edges) =>
                            edges.filter(
                              ({ source, sourceHandle }) =>
                                !(source === id && sourceHandle === "timeOut")
                            )
                          );
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  timeOut: {
                                    ...dataN?.timeOut,
                                    action: {
                                      ...dataN?.timeOut?.action,
                                      run: "END_FLOW",
                                    },
                                  },
                                } as DataNode;
                              }
                              return node;
                            })
                          );
                        }}
                      />
                      <span>Encerrar o fluxo</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="fixed pointer-events-none rounded-sm left-1/2 -translate-x-1/2 -bottom-4 bg-white/5 text-white/60 px-1">
          <span className="tracking-widest" style={{ fontSize: 7 }}>
            {id}
          </span>
        </div> */}

        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "30%", left: -15 }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          id="main"
          position={Position.Right}
          style={{ top: "30%", right: -15 }}
          isConnectable={isConnectable}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
