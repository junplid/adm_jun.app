import { Input, Radio, RadioGroup, Textarea } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineFieldTime } from "react-icons/ai";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdOutlineAdd } from "react-icons/md";
import { TfiMenuAlt } from "react-icons/tfi";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";

const optionsValidateTime = [
  { label: "Minutos", value: "MINUTES" },
  { label: "Horas", value: "HOURS" },
  { label: "Dias", value: "DAYS" },
];

type TypeActions = "SUBMIT_FLOW" | "FORK" | "END_FLOW";

interface DataNode {
  interval: number;
  header: string;
  items: {
    value: string;
    activators: { value: string; key: string }[];
    key: string;
  }[];
  footer?: string;
  validateReply?: {
    attempts: number;
    messageErrorAttempts?: { interval: number; value: string };
    failedAttempts?: {
      interval: number;
      value: string;
      action: TypeActions;
      submitFlowId?: number;
    };
    timeOut?: {
      type: "MINUTES" | "HOURS" | "DAYS";
      value: number;
      action: {
        interval: number;
        value: string;
        run: TypeActions;
        submitFlowId?: number;
      };
    };
  };
}

export const NodeMenu: React.FC<Node> = ({ id }): JSX.Element => {
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
  const [fieldsActivator, setFieldsActivator] = useState<{
    [x: string]: string;
  }>({} as { [x: string]: string });

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.flows.length && isFirst) {
      actions.getFlows();
      setIsFirst(true);
    }
  }, [options.flows.length, isFirst]);

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
        icon: TfiMenuAlt,
        label: "Menu",
        style: { bgColor: "#09900b", color: "#ffffff" },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="nopan flex flex-col gap-y-3 px-1 pb-1">
        <div className="flex flex-col">
          <label className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2 py-1">
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
                title={`${data.interval ?? 0} Segundos`}
                value={data.interval ?? "0"}
                onChange={({ target }) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          interval: Number(target.value),
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
              />
              <AiOutlineFieldTime size={18} />
            </div>
          </label>
          <div className="flex flex-col gap-y-1 py-3">
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-white/80">
                Cabeçalho
                <strong className="font-semibold text-red-500">*</strong>
              </span>
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#2d3b55"}
                size={"xs"}
                fontSize={10}
                placeholder="Cabeçalho"
                onChange={({ target }) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          header: target.value,
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                value={data.header ?? ""}
              />
            </label>
            <div className="my-1 flex flex-col gap-2">
              <ul className="space-y-1">
                {data?.items?.map((item) => (
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
                              const newItems = dataN.items
                                .filter((i) => {
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
                                })
                                .map((ni, indice) => {
                                  ni.activators.shift();
                                  const activator = String(indice + 1);
                                  const newActivadors = [
                                    { value: activator, key: nanoid() },
                                    ...ni.activators,
                                  ];
                                  return { ...ni, activators: newActivadors };
                                });

                              node.data = {
                                ...dataN,
                                items: newItems,
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
                        <span className="font-semibold tracking-wide">
                          {`[${item.activators[0].value}]`}
                        </span>
                        <input
                          type="text"
                          className="w-full border-none bg-transparent text-white outline-none placeholder:font-light placeholder:text-white"
                          placeholder="Digite a opção"
                          value={item.value ?? ""}
                          onChange={({ target }) => {
                            setNodes((nodes) => {
                              return nodes?.map((node) => {
                                if (node.id === id) {
                                  const dataN: DataNode = node.data;
                                  const newItems = dataN.items.map((it) => {
                                    if (it.key === item.key) {
                                      it.value = target.value;
                                    }
                                    return it;
                                  });

                                  node.data = {
                                    ...dataN,
                                    items: newItems,
                                  } as DataNode;
                                }
                                return node;
                              });
                            });
                          }}
                        />
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        {item.activators.length > 1 ? (
                          <div className="flex flex-col">
                            <span className="font-semibold">Ativadores:</span>
                            <div className="w-full">
                              <span className="nodrag flex flex-wrap">
                                {item.activators.map(
                                  (act, indice) =>
                                    indice > 0 && (
                                      <span
                                        key={act.key}
                                        className="cursor-pointer px-1 duration-200 hover:bg-red-500"
                                        onClick={() => {
                                          setNodes((nodes) => {
                                            return nodes?.map((node) => {
                                              if (node.id === id) {
                                                const dataN: DataNode =
                                                  node.data;
                                                const newItems =
                                                  dataN.items.map((it) => {
                                                    if (it.key === item.key) {
                                                      const newActivator =
                                                        it.activators.filter(
                                                          (acti) =>
                                                            acti.key !== act.key
                                                        );
                                                      it.activators =
                                                        newActivator;
                                                    }
                                                    return it;
                                                  });

                                                node.data = {
                                                  ...dataN,
                                                  items: newItems,
                                                } as DataNode;
                                              }
                                              return node;
                                            });
                                          });
                                        }}
                                      >
                                        {act.value}
                                      </span>
                                    )
                                )}
                              </span>
                            </div>
                          </div>
                        ) : undefined}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setNodes((nodes) => {
                              return nodes?.map((node) => {
                                if (node.id === id) {
                                  const dataN: DataNode = node.data;
                                  const newItems = dataN.items.map((it) => {
                                    if (it.key === item.key) {
                                      const isAlreadyExist = it.activators.some(
                                        (acti) =>
                                          acti.value ===
                                          fieldsActivator[item.key]
                                      );
                                      if (!isAlreadyExist) {
                                        it.activators.push({
                                          key: nanoid(),
                                          value: fieldsActivator[item.key],
                                        });
                                      } else {
                                        alert(
                                          `O ativador: ${fieldsActivator} já existe!`
                                        );
                                      }
                                    }
                                    return it;
                                  });

                                  node.data = {
                                    ...dataN,
                                    items: newItems,
                                  } as DataNode;
                                }
                                return node;
                              });
                            });
                            setFieldsActivator((state) => ({
                              ...state,
                              [item.key]: "",
                            }));
                          }}
                          className="flex gap-1"
                        >
                          <Input
                            focusBorderColor="#f6bb0b"
                            borderColor={"#2d3b55"}
                            size={"xs"}
                            fontSize={10}
                            placeholder="Adicionar ativador"
                            onChange={({ target }) =>
                              setFieldsActivator((fields) => ({
                                ...fields,
                                [item.key]: target.value,
                              }))
                            }
                            value={fieldsActivator[item.key]}
                          />
                          <button className="nodrag min-h-full cursor-pointer bg-green-500 px-1 duration-200 hover:bg-green-400">
                            <MdOutlineAdd size={15} />
                          </button>
                        </form>
                      </div>
                    </div>
                    <CustomHandle
                      handleId={item.key}
                      nodeId={id}
                      type="source"
                      position={Position.Right}
                      style={{ right: -30, top: "50%" }}
                      isConnectable={isConnectable}
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
                        const itemId = nanoid();
                        const activator = String(
                          (node.data?.items?.length ?? 0) + 1
                        );

                        const newItems = dataN.items?.length
                          ? [
                              ...dataN.items,
                              {
                                key: itemId,
                                value: "",
                                activators: [
                                  { value: activator, key: nanoid() },
                                ],
                              },
                            ]
                          : [
                              {
                                key: itemId,
                                value: "",
                                activators: [
                                  { value: activator, key: nanoid() },
                                ],
                              },
                            ];

                        node.data = {
                          ...dataN,
                          items: newItems,
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
              >
                <span>Adicionar uma nova opção</span>
                <IoMdAdd size={14} />
              </button>
            </div>
            <label className="flex flex-col gap-1">
              <span className="font-semibold text-white/80">Rodapé</span>
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#2d3b55"}
                size={"xs"}
                fontSize={10}
                placeholder="Rodapé"
                onChange={({ target }) =>
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          footer: target.value,
                        } as DataNode;
                      }
                      return node;
                    });
                  })
                }
                value={data.footer ?? ""}
              />
            </label>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-y-1">
              <span className="text-white/90">
                Enviar mensagem de erro se a resposta estiver inválida
              </span>
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-2">
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
                          data.validateReply?.messageErrorAttempts?.interval ??
                          2
                        } Segundos`}
                        value={
                          data.validateReply?.messageErrorAttempts?.interval ??
                          "2"
                        }
                        onChange={({ target }) => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  validateReply: {
                                    ...dataN.validateReply,
                                    messageErrorAttempts: {
                                      ...dataN.validateReply
                                        ?.messageErrorAttempts,
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
                    <Textarea
                      focusBorderColor="#f6bb0b"
                      borderColor={"#1a2538"}
                      padding={"2"}
                      paddingLeft={2}
                      resize={"none"}
                      className="nodrag rounded-lg rounded-tl-none p-1 pr-4 leading-tight"
                      style={{
                        boxShadow: "0 1px 1px #0707071d",
                        fontSize: 10,
                        background: "#131a27",
                      }}
                      value={
                        data.validateReply?.messageErrorAttempts?.value ?? ""
                      }
                      onChange={({ target }) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              node.data = {
                                ...dataN,
                                validateReply: {
                                  ...dataN.validateReply,
                                  messageErrorAttempts: {
                                    ...dataN.validateReply
                                      ?.messageErrorAttempts,
                                    value: target.value,
                                  },
                                },
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
                      placeholder="Digite a mensagem aqui"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-y-1">
                  <div className="flex items-center justify-between gap-x-2">
                    <span className="text-white/90">
                      Quantidade de tentativas
                    </span>
                    <Input
                      focusBorderColor="#f6bb0b"
                      borderColor={"#354564"}
                      size={"xs"}
                      width={"16"}
                      type="number"
                      min={1}
                      max={10}
                      fontSize={10}
                      title={`${data.validateReply?.attempts ?? 0} Tentativas`}
                      value={data.validateReply?.attempts ?? "0"}
                      onChange={({ target }) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              node.data = {
                                ...dataN,
                                validateReply: {
                                  ...dataN.validateReply,
                                  attempts: Number(target.value),
                                },
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 bg-slate-800/50 pb-3">
                    <i className="p-2 text-white/90">
                      Após esgotar as tentativas envie uma mensagem e tome uma
                      decisão
                    </i>
                    <div className="flex flex-col gap-y-2 px-2">
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
                              data.validateReply?.failedAttempts?.interval ?? 2
                            } Segundos`}
                            value={
                              data.validateReply?.failedAttempts?.interval ??
                              "2"
                            }
                            onChange={({ target }) => {
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    node.data = {
                                      ...dataN,
                                      validateReply: {
                                        ...dataN.validateReply,
                                        failedAttempts: {
                                          ...dataN.validateReply
                                            ?.failedAttempts,
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
                        <Textarea
                          focusBorderColor="#f6bb0b"
                          borderColor={"#1a2538"}
                          padding={"2"}
                          paddingLeft={2}
                          resize={"none"}
                          className="nodrag rounded-lg rounded-tl-none p-1 pr-4 leading-tight"
                          style={{
                            boxShadow: "0 1px 1px #0707071d",
                            fontSize: 10,
                            background: "#131a27",
                          }}
                          value={
                            data.validateReply?.failedAttempts?.value ?? ""
                          }
                          onChange={({ target }) => {
                            setNodes((nodes) =>
                              nodes.map((node) => {
                                const dataN: DataNode = node.data;
                                if (node.id === id) {
                                  node.data = {
                                    ...dataN,
                                    validateReply: {
                                      ...dataN.validateReply,
                                      failedAttempts: {
                                        ...dataN.validateReply?.failedAttempts,
                                        value: target.value,
                                      },
                                    },
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
                            target.style.height =
                              //@ts-expect-error
                              target.scrollHeight + 2 + "px";
                          }}
                          placeholder="Digite a mensagem aqui"
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
                                data.validateReply?.failedAttempts?.action ===
                                "SUBMIT_FLOW"
                              }
                              onChange={() => {
                                setEdges((edges) =>
                                  edges.filter(
                                    ({ source, sourceHandle }) =>
                                      !(
                                        source === id &&
                                        sourceHandle === "failedAttempts"
                                      )
                                  )
                                );
                                setNodes((nodes) =>
                                  nodes.map((node) => {
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      node.data = {
                                        ...dataN,
                                        validateReply: {
                                          ...dataN.validateReply,
                                          failedAttempts: {
                                            ...dataN.validateReply
                                              ?.failedAttempts,
                                            action: "SUBMIT_FLOW",
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
                          {data.validateReply?.failedAttempts?.action ===
                            "SUBMIT_FLOW" && (
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
                                onChange={(propsV) =>
                                  setNodes((nodes) =>
                                    nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        node.data = {
                                          ...node.data,
                                          validateReply: {
                                            ...data.validateReply,
                                            failedAttempts: {
                                              ...dataN.validateReply
                                                ?.failedAttempts,
                                              submitFlowId: Number(
                                                propsV.value
                                              ),
                                            },
                                          },
                                        } as DataNode;
                                      }
                                      return node;
                                    })
                                  )
                                }
                                value={
                                  data?.validateReply?.failedAttempts
                                    ?.submitFlowId
                                    ? {
                                        label:
                                          options.flows.find(
                                            (v) =>
                                              Number(v.id) ===
                                              data?.validateReply
                                                ?.failedAttempts?.submitFlowId
                                          )?.name ?? "",
                                        value:
                                          data?.validateReply?.failedAttempts
                                            ?.submitFlowId,
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
                              isChecked={
                                data.validateReply?.failedAttempts?.action ===
                                "FORK"
                              }
                              onChange={() => {
                                setNodes((nodes) =>
                                  nodes.map((node) => {
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      node.data = {
                                        ...dataN,
                                        validateReply: {
                                          ...dataN.validateReply,
                                          failedAttempts: {
                                            ...dataN.validateReply
                                              ?.failedAttempts,
                                            action: "FORK",
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
                          <CustomHandle
                            handleId={"red failedAttempts"}
                            nodeId={id}
                            type="source"
                            position={Position.Right}
                            style={{ right: -29, background: "red" }}
                            isConnectable={
                              isConnectable
                                ? data.validateReply?.failedAttempts?.action ===
                                  "FORK"
                                : false
                            }
                          />
                        </label>
                        <label className="flex gap-x-2 px-2">
                          <Radio
                            size={"sm"}
                            colorScheme="green"
                            isChecked={
                              data.validateReply?.failedAttempts?.action ===
                              "END_FLOW"
                            }
                            onChange={() => {
                              setEdges((edges) =>
                                edges.filter(
                                  ({ source, sourceHandle }) =>
                                    !(
                                      source === id &&
                                      sourceHandle === "failedAttempts"
                                    )
                                )
                              );
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    node.data = {
                                      ...dataN,
                                      validateReply: {
                                        ...dataN.validateReply,
                                        failedAttempts: {
                                          ...dataN.validateReply
                                            ?.failedAttempts,
                                          action: "END_FLOW",
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
            <div className="border-t border-white/20"></div>
            <div className="flex flex-col gap-y-2 bg-slate-800/50 pb-3">
              <i className="p-2 text-white/90">
                Se não houver resposta após um certo período, envie uma mensagem
                e tome uma decisão
              </i>
              <div className="flex flex-col gap-y-2 px-2">
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
                                  validateReply: {
                                    ...dataN.validateReply,
                                    timeOut: {
                                      ...dataN.validateReply?.timeOut,
                                      type: propsV.value,
                                    },
                                  },
                                } as DataNode;
                              }
                              return node;
                            })
                          )
                        }
                        value={
                          data?.validateReply?.timeOut?.type
                            ? {
                                label:
                                  optionsValidateTime.find(
                                    (v) =>
                                      v.value ===
                                      data?.validateReply?.timeOut?.type
                                  )?.label ?? "",
                                value: data?.validateReply?.timeOut?.type,
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
                        title={`${
                          data.validateReply?.timeOut?.value ?? 1
                        } Segundos`}
                        value={data.validateReply?.timeOut?.value ?? "1"}
                        onChange={({ target }) => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  validateReply: {
                                    ...dataN.validateReply,
                                    timeOut: {
                                      ...dataN.validateReply?.timeOut,
                                      value: Number(target.value),
                                    },
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
                        data.validateReply?.timeOut?.action?.interval ?? 2
                      } Segundos`}
                      value={
                        data.validateReply?.timeOut?.action?.interval ?? "2"
                      }
                      onChange={({ target }) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              node.data = {
                                ...dataN,
                                validateReply: {
                                  ...dataN.validateReply,
                                  timeOut: {
                                    ...dataN.validateReply?.timeOut,
                                    action: {
                                      ...dataN.validateReply?.timeOut?.action,
                                      interval:
                                        Number(target.value) <= 1
                                          ? 2
                                          : Number(target.value),
                                    },
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
                  <Textarea
                    focusBorderColor="#f6bb0b"
                    borderColor={"#1a2538"}
                    padding={"2"}
                    paddingLeft={2}
                    resize={"none"}
                    className="nodrag rounded-lg rounded-tl-none p-1 pr-4 leading-tight"
                    style={{
                      boxShadow: "0 1px 1px #0707071d",
                      fontSize: 10,
                      background: "#131a27",
                    }}
                    value={data.validateReply?.timeOut?.action?.value ?? ""}
                    onChange={({ target }) => {
                      setNodes((nodes) =>
                        nodes.map((node) => {
                          const dataN: DataNode = node.data;
                          if (node.id === id) {
                            node.data = {
                              ...dataN,
                              validateReply: {
                                ...dataN.validateReply,
                                timeOut: {
                                  ...dataN.validateReply?.timeOut,
                                  action: {
                                    ...dataN.validateReply?.timeOut?.action,
                                    value: target.value,
                                  },
                                },
                              },
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
                      target.style.height =
                        //@ts-expect-error
                        target.scrollHeight + 2 + "px";
                    }}
                    placeholder="Digite a mensagem aqui"
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
                          data.validateReply?.timeOut?.action?.run ===
                          "SUBMIT_FLOW"
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
                                  validateReply: {
                                    ...dataN.validateReply,
                                    timeOut: {
                                      ...dataN.validateReply?.timeOut,
                                      action: {
                                        ...dataN.validateReply?.timeOut?.action,
                                        run: "SUBMIT_FLOW",
                                      },
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
                    {data.validateReply?.timeOut?.action?.run ===
                      "SUBMIT_FLOW" && (
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
                                    validateReply: {
                                      ...data.validateReply,
                                      timeOut: {
                                        ...dataN.validateReply?.timeOut,
                                        action: {
                                          ...dataN.validateReply?.timeOut
                                            ?.action,
                                          submitFlowId: Number(propsV.value),
                                        },
                                      },
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                          value={
                            data?.validateReply?.timeOut?.action?.submitFlowId
                              ? {
                                  label:
                                    options.flows.find(
                                      (v) =>
                                        Number(v.id) ===
                                        data?.validateReply?.timeOut?.action
                                          ?.submitFlowId
                                    )?.name ?? "",
                                  value:
                                    data?.validateReply?.timeOut?.action
                                      ?.submitFlowId,
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
                        isChecked={
                          data.validateReply?.timeOut?.action?.run === "FORK"
                        }
                        onChange={() => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  validateReply: {
                                    ...dataN.validateReply,
                                    timeOut: {
                                      ...dataN.validateReply?.timeOut,
                                      action: {
                                        ...dataN.validateReply?.timeOut?.action,
                                        run: "FORK",
                                      },
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
                    <CustomHandle
                      handleId={"red timeOut"}
                      nodeId={id}
                      type="source"
                      position={Position.Right}
                      style={{ right: -29, background: "red" }}
                      isConnectable={
                        isConnectable
                          ? data.validateReply?.timeOut?.action?.run === "FORK"
                          : false
                      }
                    />
                  </label>
                  <label className="flex gap-x-2 px-2">
                    <Radio
                      size={"sm"}
                      colorScheme="green"
                      isChecked={
                        data.validateReply?.timeOut?.action?.run === "END_FLOW"
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
                                validateReply: {
                                  ...dataN.validateReply,
                                  timeOut: {
                                    ...dataN.validateReply?.timeOut,
                                    action: {
                                      ...dataN.validateReply?.timeOut?.action,
                                      run: "END_FLOW",
                                    },
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

        {/* <div className="fixed pointer-events-none rounded-sm left-1/2 -translate-x-1/2 -bottom-4 bg-white/5 text-white/60 px-1">
          <span className="tracking-widest" style={{ fontSize: 7 }}>
            {id}
          </span>
        </div> */}

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
