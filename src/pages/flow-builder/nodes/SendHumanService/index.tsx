import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { FaUserFriends } from "react-icons/fa";

const optionsDestination = [
  { label: "Setor", value: "sector" },
  { label: "Atendente", value: "attendant" },
];

type DataNode = (
  | {
      destination: "attendant";
      attendantId: number;
      businessId: number;
      sectorId: number;
    }
  | {
      destination: "sector";
      attendantId?: number;
      businessId: number;
      sectorId: number;
    }
) & {
  columnId: number;
};

export const NodeSendHumanService: React.FC<Node> = ({ id }): JSX.Element => {
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

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) return;
    if (!options.business.length) {
      actions.getBusiness();
      setIsFirst(true);
    }
    if (!options.sectors.length) {
      actions.getSectors();
      setIsFirst(true);
    }
    if (!options.attendats.length) {
      actions.getAttendants(data.sectorId);
      setIsFirst(true);
    }
    if (!options.kanbanColumns.length) {
      actions.getKanbanColumns();
      setIsFirst(true);
    }
  }, [
    data.sectorId,
    options.business.length,
    options.sectors.length,
    options.attendats.length,
    options.kanbanColumns.length,
    isFirst,
  ]);

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
      size="190px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: FaUserFriends,
        label: "Atendimento humano",
        style: {
          bgColor: "#c34c07",
          color: "#ffffff",
        },
      }}
    >
      <div className="nopan flex flex-col gap-y-1 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Selecione o destino
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
                      destination: propsV.value,
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={optionsDestination}
            isMulti={false}
            noOptionsMessage="Nenhum destino encontrado"
            placeholder="Selecione o destino*"
            value={
              data.destination
                ? {
                    label:
                      optionsDestination.find(
                        (v) => v.value === data.destination
                      )?.label ?? "",
                    value: data.destination,
                  }
                : undefined
            }
          />
        </label>
        {data.destination && (
          <>
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione o negócio
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
                          businessId: Number(propsV.value),
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                options={options.business.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
                isMulti={false}
                noOptionsMessage="Nenhum negócio encontrada"
                placeholder="Selecione o negócio*"
                value={
                  data.businessId
                    ? {
                        label:
                          options.business.find((v) => v.id === data.businessId)
                            ?.name ?? "",
                        value: Number(data.businessId),
                      }
                    : undefined
                }
              />
            </label>
            {data.businessId && (
              <>
                <label className="nodrag flex flex-col gap-y-1">
                  <span className="font-semibold text-white/80">
                    Selecione o setor
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
                              sectorId: Number(propsV.value),
                            } as DataNode;
                          }
                          return node;
                        })
                      )
                    }
                    options={options.sectors.map((v) => ({
                      label: v.name,
                      value: v.id,
                    }))}
                    isMulti={false}
                    noOptionsMessage="Nenhuma setor encontrado"
                    placeholder="Selecione o setor*"
                    value={
                      data.sectorId
                        ? {
                            label:
                              options.sectors.find(
                                (v) => v.id === data.sectorId
                              )?.name ?? "",
                            value: Number(data.sectorId),
                          }
                        : undefined
                    }
                  />
                </label>
                {data.destination === "attendant" && (
                  <label className="nodrag flex flex-col gap-y-1">
                    <span className="font-semibold text-white/80">
                      Selecione o atendente
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
                                attendantId: Number(propsV.value),
                              } as DataNode;
                            }
                            return node;
                          })
                        )
                      }
                      options={options.attendats.map((v) => ({
                        label: v.name,
                        value: v.id,
                      }))}
                      isMulti={false}
                      noOptionsMessage="Nenhum atendente encontrado"
                      placeholder="Selecione o atendente*"
                      value={
                        data.attendantId
                          ? {
                              label:
                                options.attendats.find(
                                  (v) => v.id === data.attendantId
                                )?.name ?? "",
                              value: Number(data.attendantId),
                            }
                          : undefined
                      }
                    />
                  </label>
                )}
              </>
            )}
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione a coluna do funil
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
                          columnId: Number(propsV.value),
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                options={options.kanbanColumns.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
                isMulti={false}
                noOptionsMessage="Nenhuma coluna de entrada"
                placeholder="Selecione a coluna de entrada*"
                value={
                  data.columnId
                    ? {
                        label:
                          options.kanbanColumns.find(
                            (v) => v.id === data.columnId
                          )?.name ?? "",
                        value: Number(data.columnId),
                      }
                    : undefined
                }
              />
            </label>
          </>
        )}

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{
            top: "30%",
            left: -15,
          }}
        />
        <Handle
          type="source"
          id="main"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ top: "30%", right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
