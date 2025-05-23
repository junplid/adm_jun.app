import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import TextareaAutosize from "react-textarea-autosize";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";
import { Button, Input } from "@chakra-ui/react";
import { TbRobot } from "react-icons/tb";
import { CustomHandle } from "../../customs/node";
import { nanoid } from "nanoid";
import { IoClose } from "react-icons/io5";

type DataNode = {
  attendantAI: number;
  typingTime?: number;
  prompt?: string;
  objective?: string;
  waitForCompletion?: number;
  roles?: { limitInteractions?: number };
  actions?: {
    type: "variable" | "add-tag" | "del-tag";
    id?: number;
    prompt: string;
    key: string;
  }[];
};

export const NodeAttendantAIService: React.FC<Node> = ({ id }): JSX.Element => {
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
  const [loadCreateVariable, setLoadCreateVariable] = useState(false);

  const store = useStoreApi();

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) return;
    if (!options.attendantsAI.length) {
      actions.getAttendantsAI();
      setIsFirst(true);
    }
  }, [options.attendantsAI.length, isFirst]);

  const [isFirstVars, setIsFirstVars] = useState(true);
  useEffect(() => {
    if (!isFirstVars) return;
    if (!options.variables.length) {
      actions.getVariables();
      setIsFirstVars(true);
    }
  }, [options.variables.length, isFirstVars]);

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

  const listVariablesUsed = useMemo(() => {
    return data.actions?.filter((s) => s.id).map((s) => s.id);
  }, [data.actions?.map(({ id }) => id)]);

  return (
    <PatternNode.PatternContainer
      size="220px"
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: TbRobot,
        label: "Tarefa atendente IA",
        style: { bgColor: "#943d0b", color: "#ffffff" },
      }}
    >
      <div className="flex flex-col gap-y-2 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col">
          <span className="font-semibold text-white/80">
            Selecione o atendente
          </span>
          <SelectComponent
            styles={{
              valueContainer: { paddingLeft: 9 },
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
                      attendantAI: Number(propsV.value),
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.attendantsAI.map((v) => ({
              label: v.name,
              value: v.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhum atendente IA encontrado"
            placeholder="Selecione o atendente IA*"
            value={
              data.attendantAI
                ? {
                    label:
                      options.attendantsAI.find(
                        (v) => v.id === data.attendantAI
                      )?.name ?? "",
                    value: Number(data.attendantAI),
                  }
                : undefined
            }
          />
        </label>
        <label className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2 px-2.5">
          <div className="flex flex-col" style={{ fontSize: 9 }}>
            <h4 className="font-semibold">Segundos digitando</h4>
            <span className="text-white/50" style={{ fontSize: 8 }}>
              para enviar a mensagem
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              focusBorderColor="#f6bb0b"
              borderColor={"#354564"}
              size={"xs"}
              width={"14"}
              type="number"
              min={2}
              fontSize={9}
              title={`${data.typingTime ?? 2} Segundos`}
              value={data.typingTime ?? "2"}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = { ...node.data, typingTime: target.value };
                    }
                    return node;
                  })
                );
              }}
            />
          </div>
        </label>
        <label className="nodrag nowheel flex flex-col">
          <span className="font-semibold text-white/80">Prompt adicional</span>
          <AutoCompleteTextarea
            textareaProps={{
              focusBorderColor: "#f6bb0b",
              borderColor: "#0e181a",
              autoComplete: "off",
              maxRows: 5,
              rows: 3,
              className:
                "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
              style: {
                boxShadow: "0 1px 1px #0707071d",
                fontSize: 10,
                background: "#0a0f0f",
              },
              padding: "2",
              paddingLeft: "2",
              resize: "none",
              as: TextareaAutosize,
            }}
            tokens={{
              "{{": { getOptions: actions.getVariablesReturnValues },
            }}
            placeholder="Ex: Pergunte o nome do lead"
            value={data.prompt ?? ""}
            setValue={(value) => {
              const { nodeInternals } = store.getState();
              const arrayNodes = Array.from(nodeInternals.values());
              setNodes(
                arrayNodes.map((node) => {
                  if (node.id === id) {
                    node.data = { ...node.data, prompt: value };
                  }
                  return node;
                })
              );
            }}
          />
        </label>
        <div className="flex flex-col gap-y-1 rounded-lg border border-dashed border-slate-700 p-2 px-2.5">
          <label className="flex items-center justify-between gap-2">
            <div className="flex flex-col" style={{ fontSize: 9 }}>
              <h4 className="font-semibold">Segundos aguardando</h4>
              <span className="text-white/50" style={{ fontSize: 8 }}>
                respostas da pergunta atual
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#354564"}
                size={"xs"}
                width={"10"}
                type="number"
                fontSize={9}
                title={`${data.waitForCompletion || 0} Segundos`}
                value={data.waitForCompletion ?? "0"}
                onChange={({ target }) => {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = {
                          ...node.data,
                          waitForCompletion: Number(target.value),
                        };
                      }
                      return node;
                    })
                  );
                }}
              />
            </div>
          </label>
          <p className="text-white/50" style={{ fontSize: 9 }}>
            Dica: Use quando espera-se mais de um balão de resposta nas
            perguntas
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h4 className="font-semibold text-orange-400">Executar ações</h4>
            <span className="text-white/50" style={{ fontSize: 9 }}>
              durante as interações
            </span>
          </div>
          <div className="mb-2 mt-1 flex w-full flex-col gap-y-1">
            {data.actions?.map((action) => (
              <div
                key={action.key}
                className="group relative ml-1 flex flex-col items-baseline p-1 focus-within:bg-white/5 hover:bg-white/5"
              >
                {!!action.id && (
                  <span
                    className="nodrag mb-0.5 block cursor-pointer select-text text-blue-300 underline-offset-2 hover:text-red-400 hover:underline"
                    style={{ fontSize: 8 }}
                    onClick={() => {
                      setNodes((nodes) =>
                        nodes.map((node) => {
                          if (node.id === id) {
                            node.data = {
                              ...node.data,
                              actions: node.data.actions.map((s: any) => {
                                if (s.key === action.key) {
                                  s.id = undefined;
                                }
                                return s;
                              }),
                            };
                          }
                          return node;
                        })
                      );
                    }}
                  >
                    <strong>VARIAVEL</strong> #
                    {options.variables.find((s) => action.id === s.id)?.id}{" "}
                    {options.variables.find((s) => action.id === s.id)?.name}
                  </span>
                )}
                {!action.id && (
                  <label className="nodrag mb-1 w-full flex-col">
                    <SelectComponent
                      styles={{
                        valueContainer: { paddingLeft: 9 },
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
                                actions: node.data.actions.map((s: any) => {
                                  if (s.key === action.key) {
                                    s.id = Number(propsV.value);
                                  }
                                  return s;
                                }),
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
                            await actions.createVariable(value);
                            setLoadCreateVariable(false);
                          }}
                          isLoading={loadCreateVariable}
                        >
                          <span style={{ fontSize: 11 }}>
                            Criar nova variável
                          </span>
                        </Button>
                      )}
                      options={options.variables
                        .filter((s) => !listVariablesUsed?.includes(s.id))
                        .map((v) => ({
                          label: v.name,
                          value: v.id,
                        }))}
                      isMulti={false}
                      noOptionsMessage="Nenhuma variável encontrada"
                      placeholder="Selecione a variável*"
                      // value={
                      //   data.attendantAI
                      //     ? {
                      //         label:
                      //           options.variables.find(
                      //             (v) => v.id === action.
                      //           )?.name ?? "",
                      //         value: Number(data.attendantAI),
                      //       }
                      //     : undefined
                      // }
                    />
                  </label>
                )}
                <input
                  type="text"
                  className="nodrag w-full bg-white/5 p-0.5 pl-1 outline-0 focus:bg-white/10"
                  placeholder="Ex: O nome do lead"
                  style={{ fontSize: 9 }}
                  value={action.prompt}
                  onChange={({ target }) => {
                    setNodes((nodes) =>
                      nodes.map((node) => {
                        if (node.id === id) {
                          node.data = {
                            ...node.data,
                            actions: node.data.actions.map((ac: any) => {
                              if (ac.key === action.key) {
                                ac.prompt = target.value;
                              }
                              return ac;
                            }),
                          };
                        }
                        return node;
                      })
                    );
                  }}
                />
                <button
                  onClick={() => {
                    setNodes((nodes) =>
                      nodes.map((node) => {
                        if (node.id === id) {
                          node.data = {
                            ...node.data,
                            actions: node.data.actions.filter(
                              (s: any) => s.key !== action.key
                            ),
                          };
                        }
                        return node;
                      })
                    );
                  }}
                  className="nodrag absolute -left-4 top-1/2 -translate-y-1/2 translate-x-0.5 p-0.5 text-white/20 duration-200 group-hover:bg-red-500/5 group-hover:text-red-500"
                >
                  <IoClose size={10} />
                </button>
              </div>
            ))}
          </div>
          <Button
            size={"xs"}
            colorScheme="blackAlpha"
            type="button"
            w={"100%"}
            fontSize={9}
            className="nopan"
            onClick={() => {
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === id) {
                    const newItem = {
                      key: nanoid(),
                      type: "variable",
                      prompt: "",
                    };
                    node.data = {
                      ...node.data,
                      actions: node.data.actions?.length
                        ? [...node.data.actions, newItem]
                        : [newItem],
                    };
                  }
                  return node;
                })
              );
            }}
          >
            Adicionar ou Sobrescrever variaveis
          </Button>
        </div>
        <div className="relative">
          <label className="nodrag nowheel flex flex-col">
            <h4 className="font-semibold text-green-500/70">Objetivo</h4>
            <AutoCompleteTextarea
              textareaProps={{
                focusBorderColor: "#f6bb0b",
                borderColor: "#0e181a",
                autoComplete: "off",
                maxRows: 5,
                rows: 3,
                className:
                  "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                style: {
                  boxShadow: "0 1px 1px #0707071d",
                  fontSize: 10,
                  background: "#0a0f0f",
                },
                padding: "2",
                paddingLeft: "2",
                resize: "none",
                as: TextareaAutosize,
              }}
              tokens={{
                "{{": { getOptions: actions.getVariablesReturnValues },
              }}
              placeholder="Ex: Conseguir o nome do lead"
              value={data.objective ?? ""}
              setValue={(value) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = { ...node.data, objective: value };
                    }
                    return node;
                  })
                );
              }}
            />
          </label>
          <CustomHandle
            nodeId={id}
            handleId="green goal-achieved"
            type="source"
            position={Position.Right}
            style={{
              right: -29,
              background: "#4ab319",
              transition: "210ms ease",
              top: "50%",
              transform: "translateY(-50%)",
              position: "absolute",
            }}
            isConnectable={isConnectable}
          />
        </div>

        <div className="relative">
          <label className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <h4 className="font-semibold text-red-500/70">
                Limite de interações
              </h4>
              <span className="text-white/50" style={{ fontSize: 8 }}>
                Quantidade total de interações
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#354564"}
                size={"xs"}
                width={"12"}
                type="number"
                fontSize={9}
                min={3}
                max={200}
                title={`${data.roles?.limitInteractions || 3} interações`}
                value={data.roles?.limitInteractions ?? "3"}
                onChange={({ target }) => {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = {
                          ...node.data,
                          roles: {
                            ...node.data.roles,
                            limitInteractions:
                              Number(target.value) > 200
                                ? 200
                                : Number(target.value),
                          },
                        };
                      }
                      return node;
                    })
                  );
                }}
              />
            </div>
          </label>
          <CustomHandle
            nodeId={id}
            handleId="red role-limit-interactions"
            type="source"
            position={Position.Right}
            style={{
              right: -29,
              background: "#b31919",
              transition: "210ms ease",
              top: "50%",
              transform: "translateY(-50%)",
              position: "absolute",
            }}
            isConnectable={isConnectable}
          />
        </div>

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{ top: "30%", left: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
