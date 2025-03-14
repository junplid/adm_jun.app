import { Button, Input } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AuthorizationContext } from "../../../../contexts/authorization.context";
import { AiOutlinePlayCircle } from "react-icons/ai";

type TypesActions =
  | "add-tag"
  | "remove-tag"
  | "send-flow"
  | "add-to-audience"
  | "remove-to-audience"
  | "variable";

type DataNode =
  | { type: "add-tag" | "remove-tag"; tagId: number }
  | { type: "send-flow"; flowId: number }
  | { type: "finish-flow" }
  | { type: "add-to-audience" | "remove-to-audience"; audienceId: number }
  | { type: "variable"; variableId: number; value: string };

const optinsAction = [
  { label: "Adicionar tag", value: "add-tag" },
  { label: "Remover tag", value: "remove-tag" },
  { label: "Enviar fluxo", value: "send-flow" },
  { label: "Finalizar fluxo", value: "finish-flow" },
  { label: "Adicionar ao publico", value: "add-to-audience" },
  { label: "Remover do publico", value: "remove-to-audience" },
  { label: "Adicionar/Editar variável", value: "variable" },
];

export const NodeAction: React.FC<Node> = ({ id }) => {
  const {
    options,
    actions,
    reactflow: {
      listLinesIdNodesInterruoption,
      startConnection,
      listIdNodesLineDependent,
    },
  } = useContext(FlowContext);
  const { handleLogout } = useContext(AuthorizationContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [load, setLoad] = useState<boolean>(false);
  const [loadCreateVar, setLoadCreateVar] = useState<boolean>(false);
  const [loadCreateTag, setLoadCreateTag] = useState<boolean>(false);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  useEffect(() => {
    (async () => {
      try {
        setLoad(true);
        if (/^(variable)$/.test(data.type) && !options.variables.length) {
          await actions.getVariables();
        }
        if (/^(add-tag|remove-tag)$/.test(data.type) && !options.tags.length) {
          await actions.getTags("contactwa");
        }

        if (/^(send-flow)$/.test(data.type) && !options.flows.length) {
          await actions.getFlows();
        }

        if (
          /^(remove-to-audience|add-to-audience)$/.test(data.type) &&
          !options.campaignAudiences.length
        ) {
          await actions.getCampaignAudience();
        }
        setLoad(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            return handleLogout();
          }
        }
      }
    })();
  }, [data?.type]);

  const valueTypeAction = useMemo(() => {
    return data?.type
      ? {
          label: optinsAction.find((v) => v.value === data.type)?.label ?? "",
          value: data.type,
        }
      : undefined;
  }, [data.type]);

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
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      header={{
        icon: AiOutlinePlayCircle,
        label: "Ação",
        style: {
          bgColor: "#5d0888",
          color: "#ffffff",
        },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div>
        <div className="mt-2 flex flex-col gap-2 pb-1.5">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o tipo da Ação
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
              onChange={(propsV) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        type: propsV.value as TypesActions,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              options={optinsAction}
              isMulti={false}
              noOptionsMessage="Nenhuma ação encontrada"
              placeholder="Selecione a ação"
              value={valueTypeAction}
            />
          </label>
          {(data.type === "add-tag" || data.type === "remove-tag") && (
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione a Tag/Etiqueta
              </span>
              <SelectComponent
                isLoading={load}
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
                          ...dataN,
                          tagId: Number(propsV.value),
                        } as DataNode;
                      }
                      return node;
                    })
                  );
                }}
                {...(data.type === "add-tag" && {
                  buttonEmpityOnSubmitNewItem: ({ value }) => (
                    <Button
                      type="button"
                      colorScheme="green"
                      onClick={async () => {
                        setLoadCreateTag(true);
                        await actions.createTag(value);
                        setLoadCreateTag(false);
                      }}
                      isLoading={loadCreateTag}
                    >
                      <span style={{ fontSize: 11 }}>Criar nova tag</span>
                    </Button>
                  ),
                })}
                options={options.tags.map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
                isMulti={false}
                noOptionsMessage="Nenhuma tag encontrada"
                placeholder="Selecione a tag/etiqueta"
                value={
                  data?.tagId
                    ? {
                        label:
                          options.tags.find((v) => Number(v.id) === data.tagId)
                            ?.name ?? "",
                        value: data.tagId,
                      }
                    : undefined
                }
              />
            </label>
          )}
          {data.type === "variable" && (
            <>
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
                  isLoading={load}
                  onChange={(propsV) => {
                    setNodes((nodes) =>
                      nodes.map((node) => {
                        const dataN: DataNode = node.data;
                        if (node.id === id) {
                          node.data = {
                            ...dataN,
                            variableId: Number(propsV.value),
                          } as DataNode;
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
                        setLoadCreateVar(true);
                        await actions.createVariable(value);
                        setLoadCreateVar(false);
                      }}
                      isLoading={loadCreateVar}
                    >
                      <span style={{ fontSize: 11 }}>Criar nova variável</span>
                    </Button>
                  )}
                  options={options.variables.map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                  isMulti={false}
                  noOptionsMessage="Nenhuma variável encontrada"
                  placeholder="Selecione a variável"
                  value={
                    data?.variableId
                      ? {
                          label:
                            options.variables.find(
                              (v) => Number(v.id) === data.variableId
                            )?.name ?? "",
                          value: data.variableId,
                        }
                      : undefined
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-white/80">Valor</span>
                <Input
                  focusBorderColor="#f6bb0b"
                  borderColor={"#2d3b55"}
                  size={"xs"}
                  fontSize={10}
                  placeholder="Valor da variável"
                  onChange={({ target }) =>
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const dataN: DataNode = node.data;
                          node.data = {
                            ...dataN,
                            value: target.value,
                          } as DataNode;
                        }
                        return node;
                      });
                    })
                  }
                  value={data.value ?? ""}
                />
              </label>
            </>
          )}
          {data.type === "send-flow" && (
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione o fluxo
              </span>
              <SelectComponent
                isLoading={load}
                styles={{
                  valueContainer: {
                    paddingLeft: 9,
                  },
                  control: { minHeight: 20 },
                  indicatorsContainer: { padding: 5 },
                  dropdownIndicator: { padding: 3 },
                }}
                onChange={({ value }) =>
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      const dataN: DataNode = node.data;
                      if (node.id === id) {
                        node.data = {
                          ...dataN,
                          flowId: Number(value),
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                value={
                  data?.flowId
                    ? {
                        label:
                          options.flows.find(
                            (v) => Number(v.id) === data.flowId
                          )?.name ?? "",
                        value: data.flowId,
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
            </label>
          )}
          {(data.type === "add-to-audience" ||
            data.type === "remove-to-audience") && (
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione o público
              </span>
              <SelectComponent
                isLoading={load}
                styles={{
                  valueContainer: { paddingLeft: 9 },
                  control: { minHeight: 20 },
                  indicatorsContainer: { padding: 5 },
                  dropdownIndicator: { padding: 3 },
                }}
                onChange={({ value }) =>
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      const dataN: DataNode = node.data;
                      if (node.id === id) {
                        node.data = {
                          ...dataN,
                          audienceId: Number(value),
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                value={
                  data?.audienceId
                    ? {
                        label:
                          options.campaignAudiences.find(
                            (v) => Number(v.id) === data.audienceId
                          )?.name ?? "",
                        value: data.audienceId,
                      }
                    : undefined
                }
                options={options.campaignAudiences.map((f) => ({
                  label: f.name,
                  value: f.id,
                }))}
                isMulti={false}
                noOptionsMessage="Nenhum público encontrado"
                placeholder="Selecione o público"
              />
            </label>
          )}
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          position={Position.Left}
          style={{ left: -15 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ right: -15 }}
          isConnectable={isConnectable}
        />
        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
