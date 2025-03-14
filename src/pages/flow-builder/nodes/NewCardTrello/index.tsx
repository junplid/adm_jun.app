import { AxiosError } from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { api } from "../../../../services/api";
import { CustomHandle } from "../../helpers/fn";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteInput } from "../../../../components/InputAutoComplete";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";
import TextareaAutosize from "react-textarea-autosize";
import { FaTrello } from "react-icons/fa";

type DataNode = {
  name: string;
  integrationId: number;
  boardId: string;
  idList: string;
  desc?: string;
  pos?: "top" | "bottom" | number;
  due?: Date;
  start?: Date | null;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
};

const optionsPositions = [
  { label: "Topo", value: "top" },
  { label: "Último", value: "bottom" },
];

export const NodeNewCardTrello: React.FC<Node> = ({ id }): JSX.Element => {
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
  const [cookies] = useCookies(["auth"]);

  const [loadBoardsTrello, setBoardsTrello] = useState<boolean>(false);
  const [optionsBoardsTrello, setOptionsBoardsTrello] = useState<
    { name: string; id: string }[]
  >([]);

  const [loadListBoardTrello, setLoadListBoardTrello] =
    useState<boolean>(false);
  const [optionsListBoardTrello, setOptionsListBoardTrello] = useState<
    { name: string; id: string }[]
  >([]);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.integrationTrello.length && isFirst) {
      actions.getIntegrationTrello();
      setIsFirst(true);
    }
  }, [options.integrationTrello.length, isFirst]);

  useEffect(() => {
    (async () => {
      try {
        setBoardsTrello(true);
        const token = cookies.auth;
        const { data: dataAxios } = await api.get(
          `/private/boards-trello-options/${data.integrationId}`,
          { headers: { authorization: token } }
        );
        setOptionsBoardsTrello(dataAxios.boards);
        setBoardsTrello(false);
      } catch (error) {
        setBoardsTrello(true);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            alert("Não autorizado");
          }
        }
      }
    })();
  }, [data.integrationId]);

  useEffect(() => {
    if (data.boardId) {
      (async () => {
        try {
          setLoadListBoardTrello(true);
          const token = cookies.auth;
          const { data: dataAxios } = await api.get(
            `/private/list-boards-trello-options/${data.integrationId}/${data.boardId}`,
            { headers: { authorization: token } }
          );
          setOptionsListBoardTrello(dataAxios.listBoard);
          setLoadListBoardTrello(false);
        } catch (error) {
          setLoadListBoardTrello(true);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              alert("Não autorizado");
            }
          }
        }
      })();
    }
  }, [data.boardId]);

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
      size="210px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: FaTrello,
        label: "Novo card no Trello",
        style: {
          bgColor: "#c34c07",
          color: "#ffffff",
        },
      }}
    >
      <div className="nopan flex flex-col gap-y-2 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Selecione o serviço
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
                      integrationId: Number(propsV.value),
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.integrationTrello.map((e) => ({
              label: e.name,
              value: e.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhum serviço encontrado"
            placeholder="Selecione o serviço*"
            value={
              data.integrationId
                ? {
                    label:
                      options.integrationTrello.find(
                        (s) => s.id === data.integrationId
                      )?.name ?? "",
                    value: data.integrationId,
                  }
                : undefined
            }
          />
        </label>
        {data.integrationId && optionsBoardsTrello.length ? (
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o quadro
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
              isLoading={loadBoardsTrello}
              onChange={(propsV) =>
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        boardId: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={optionsBoardsTrello.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhum quadro encontrado"
              placeholder="Selecione o quadro*"
              value={
                data.boardId
                  ? {
                      label:
                        optionsBoardsTrello.find((s) => s.id === data.boardId)
                          ?.name ?? "",
                      value: data.boardId,
                    }
                  : undefined
              }
            />
          </label>
        ) : (
          <i className="text-white/70">Não a quadros nesse serviço</i>
        )}
        {data.boardId && optionsListBoardTrello.length ? (
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione a coluna
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
              isLoading={loadListBoardTrello}
              onChange={(propsV) =>
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        idList: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={optionsListBoardTrello.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhuma coluna encontrada"
              placeholder="Selecione a coluna*"
              value={
                data.idList
                  ? {
                      label:
                        optionsListBoardTrello.find((s) => s.id === data.idList)
                          ?.name ?? "",
                      value: data.idList,
                    }
                  : undefined
              }
            />
          </label>
        ) : (
          <i className="text-white/70">Não a colunas nesse quadro</i>
        )}

        {data.idList && (
          <>
            <label className="flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Título
                <strong className="font-semibold text-red-500">*</strong>
              </span>
              <AutoCompleteInput
                tokens={{
                  "{{": { getOptions: actions.getVariablesReturnValues },
                }}
                textareaProps={{
                  focusBorderColor: "#f6bb0b",
                  borderColor: "#2d3b55",
                  size: "xs",
                  fontSize: 10,
                }}
                placeholder="Nome do card"
                setValue={(value) => {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = { ...node.data, name: value } as DataNode;
                      }
                      return node;
                    })
                  );
                }}
                value={data.name ?? ""}
              />
            </label>
            <label className="flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Descrição do card
              </span>
              <AutoCompleteTextarea
                value={data.desc ?? ""}
                setValue={(value) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          desc: value,
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                placeholder="Digite a descrição aqui"
                tokens={{
                  "{{": { getOptions: actions.getVariablesReturnValues },
                }}
                textareaProps={{
                  focusBorderColor: "#7e6c0e",
                  borderColor: "transparent",
                  background: "#d7d8d8",
                  padding: "2",
                  paddingLeft: 2,
                  resize: "none",
                  className:
                    "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                  _placeholder: { color: "#000000" },
                  style: { fontSize: 10, color: "#000000" },
                  as: TextareaAutosize,
                }}
              />
            </label>
            <label className="nodrag flex flex-col gap-y-1">
              <span className="font-semibold text-white/80">
                Selecione a posição
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
                isLoading={loadBoardsTrello}
                onChange={(propsV) =>
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = {
                          ...node.data,
                          pos: propsV.value,
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                options={optionsPositions}
                isMulti={false}
                noOptionsMessage="Nenhum quadro encontrado"
                placeholder="Selecione o quadro*"
                value={
                  data.pos
                    ? {
                        label:
                          optionsPositions.find((s) => s.value === data.pos)
                            ?.label ?? "",
                        value: data.pos,
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
        <CustomHandle
          type="source"
          handleId="main"
          nodeId={id}
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ top: "30%", right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
