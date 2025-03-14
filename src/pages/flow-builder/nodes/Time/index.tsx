import { Checkbox, Input } from "@chakra-ui/react";
import moment from "moment";
import { useContext, useMemo, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { v4 } from "uuid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../helpers/fn";
import { PatternNode } from "../Pattern";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FlowContext } from "../../../../contexts/flow.context";

type TypeData = "perTime" | "perLeadAction";
const optionsTypeData = [
  { label: "Por tempo", value: "perTime" },
  { label: "Por ação do lead", value: "perLeadAction" },
];

type TypeExpectedPerLeadAction = "text" | "midia" | "link";
const optionsExpectedPerLeadAction = [
  { label: "Texto", value: "text" },
  { label: "Mídia", value: "midia" },
  { label: "Link", value: "link" },
];

type TypeRunPerLead = "contains" | "starts-with" | "equal";
const optionsRunPerLead = [
  { label: "Contém", value: "contains" },
  { label: "Iniciando com", value: "starts-with" },
  { label: "Igual", value: "equal" },
];

type TypePerTime = "delayer" | "date";
const optionsPerTime = [
  { label: "Cronômetro", value: "delayer" },
  { label: "Data", value: "date" },
];

type TypePerTimeDelayer = "seconds" | "minutes" | "hours" | "days";
const optionsPerTimeDelayer = [
  { label: "Segundos", value: "seconds" },
  { label: "Minutos", value: "minutes" },
  { label: "Horas", value: "hours" },
  { label: "Dias", value: "days" },
];

type TypePerTimeDate = "specificDate" | "dateScheduled";
const optionsPerTimeDate = [
  { label: "Específica", value: "specificDate" },
  { label: "Programada", value: "dateScheduled" },
];

const daysWeek = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

type TypeRunDateScheduled = "nextDay" | "nextDayWeek";
const optionsRunDateScheduled = [
  { label: "Próximo dia", value: "nextDay" },
  { label: "Próximo dia da semana", value: "nextDayWeek" },
];

type DataNode =
  | {
      type: "perTime";
      data:
        | {
            option: "delayer";
            value: number;
            type: "seconds" | "minutes" | "hours" | "days";
          }
        | {
            option: "date";
            data:
              | { run: "specificDate"; data: { value: Date } }
              | {
                  run: "dateScheduled";
                  data: {
                    run: "nextDay" | "nextDayWeek";
                    day: number;
                    hourA: string;
                    hourB: string;
                  };
                };
          };
    }
  | {
      type: "perLeadAction";
      data:
        | {
            expected: "text";
            run: "contains" | "starts-with" | "equal";
            activators: {
              v: string;
              k: string;
            }[];
            caseSensitive?: boolean;
            any?: boolean;
          }
        | {
            expected: "text";
            any: true;
          }
        | { expected: "midia" | "link" };
    };

export const NodeTime: React.FC<Node> = ({ id }) => {
  const {
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [load] = useState<boolean>(false);

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
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineClockCircle,
        label: "Tempo",
        style: {
          bgColor: "#09900b",
          color: "#ffffff",
        },
      }}
    >
      <div className="py-2 pb-1">
        <i className="text-white/60">
          Bloco que pausa o fluxo por tempo determinado
        </i>
        <div className="mt-2 flex flex-col gap-2">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Só continua o fluxo após:
              <strong className="text-red-500">*</strong>
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
                        type: propsV.value as TypeData,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              options={optionsTypeData}
              isMulti={false}
              noOptionsMessage="Nenhum tipo encontrado"
              placeholder="Selecione o tipo"
              value={
                data.type
                  ? {
                      label:
                        optionsTypeData.find((s) => s.value === data.type)
                          ?.label ?? "",
                      value: data.type,
                    }
                  : undefined
              }
            />
          </label>
          {data?.type === "perLeadAction" && (
            <div className="flex flex-col gap-y-2">
              <label className="nodrag flex flex-col gap-y-1">
                <span className="font-semibold text-white/80">
                  Quando o lead enviar:
                  <strong className="text-red-500">*</strong>
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
                            data: {
                              ...dataN.data,
                              expected:
                                propsV.value as TypeExpectedPerLeadAction,
                            },
                          } as DataNode;
                        }
                        return node;
                      })
                    );
                  }}
                  options={optionsExpectedPerLeadAction}
                  isMulti={false}
                  noOptionsMessage="Nenhum tipo encontrado"
                  placeholder="Selecione o tipo"
                  value={
                    data?.data?.expected
                      ? {
                          label:
                            optionsExpectedPerLeadAction.find(
                              (s) => s.value === data.data.expected
                            )?.label ?? "",
                          value: data.data.expected,
                        }
                      : undefined
                  }
                />
              </label>
              {data?.data?.expected === "text" && (
                <div className="flex flex-col gap-y-1">
                  <label className="flex cursor-pointer gap-x-2">
                    <Checkbox
                      size={"sm"}
                      onChange={({ target }) => {
                        setNodes((nodes) =>
                          nodes.map((node) => {
                            const dataN: DataNode = node.data;
                            if (node.id === id) {
                              node.data = {
                                ...dataN,
                                data: {
                                  ...dataN.data,
                                  any: target.checked,
                                },
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                      isChecked={data?.data?.any ?? false}
                      colorScheme="green"
                    />
                    <span>Qualquer texto</span>
                  </label>
                  {!data.data.any && (
                    <>
                      <label className="nodrag flex flex-col gap-y-1">
                        <span className="font-semibold text-white/80">
                          Filtro:
                          <strong className="text-red-500">*</strong>
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
                                    data: {
                                      ...dataN.data,
                                      run: propsV.value as TypeRunPerLead,
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                          options={optionsRunPerLead}
                          isMulti={false}
                          noOptionsMessage="Nenhum tipo encontrado"
                          placeholder="Selecione o tipo"
                          value={
                            data?.data?.run
                              ? {
                                  label:
                                    optionsRunPerLead.find(
                                      (s) => s.value === (data.data as any).run
                                    )?.label ?? "",
                                  value: data.data.run,
                                }
                              : undefined
                          }
                        />
                      </label>
                      <div className="flex flex-col gap-y-1">
                        <span>
                          Textos esperados
                          <strong className="text-red-500">*</strong>
                        </span>
                        {data?.data?.activators?.length ? (
                          <ul className="flex flex-col gap-y-1">
                            {data.data.activators.map((act) => (
                              <li key={act.k} className="flex gap-x-1">
                                <button
                                  className="nodrag min-h-full cursor-pointer bg-red-500 px-1 duration-200 hover:bg-red-600"
                                  onClick={() => {
                                    setNodes((nodes) => {
                                      return nodes?.map((node) => {
                                        if (node.id === id) {
                                          const dataN: DataNode = node.data;
                                          if (
                                            data.data.expected === "text" &&
                                            !data.data.any
                                          ) {
                                            const newItems =
                                              data.data.activators?.filter(
                                                (i) => i.k !== act.k
                                              );
                                            node.data = {
                                              ...dataN,
                                              data: {
                                                ...dataN.data,
                                                activators: newItems,
                                              },
                                            } as DataNode;
                                          }
                                        }
                                        return node;
                                      });
                                    });
                                  }}
                                >
                                  <IoMdClose />
                                </button>
                                <Input
                                  focusBorderColor="#f6bb0b"
                                  borderColor={"#2d3b55"}
                                  size={"xs"}
                                  fontSize={10}
                                  placeholder="Texto esperado"
                                  onChange={({ target }) => {
                                    setNodes((nodes) => {
                                      return nodes?.map((node) => {
                                        if (node.id === id) {
                                          const dataN: DataNode = node.data;
                                          const activators = (
                                            data.data as any
                                          ).activators.map((e: any) => {
                                            if (e.k === act.k)
                                              e.v = target.value;
                                            return e;
                                          });
                                          node.data = {
                                            ...dataN,
                                            data: {
                                              ...dataN.data,
                                              activators,
                                            },
                                          } as DataNode;
                                        }
                                        return node;
                                      });
                                    });
                                  }}
                                  value={act.v ?? ""}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <i className="text-center text-white/70">
                            Adicione textos
                          </i>
                        )}
                        <button
                          onClick={() => {
                            setNodes((nodes) => {
                              return nodes?.map((node) => {
                                if (node.id === id) {
                                  const k = v4();
                                  const activators = (data.data as any)
                                    .activators?.length
                                    ? [
                                        ...(data.data as any).activators,
                                        { k, v: "" },
                                      ]
                                    : [{ k, v: "" }];

                                  node.data = {
                                    ...data,
                                    data: { ...data.data, activators },
                                  } as DataNode;
                                }
                                return node;
                              });
                            });
                          }}
                          className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
                        >
                          <span>Adicionar</span>
                          <IoMdAdd size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {data?.type === "perTime" && (
            <div className="flex flex-col gap-y-1">
              <label className="nodrag flex flex-col gap-y-1">
                <span className="font-semibold text-white/80">
                  Selecione o tipo de tempo:
                  <strong className="text-red-500">*</strong>
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
                            data: {
                              ...dataN.data,
                              option: propsV.value as TypePerTime,
                            },
                          } as DataNode;
                        }
                        return node;
                      })
                    );
                  }}
                  options={optionsPerTime}
                  isMulti={false}
                  noOptionsMessage="Nenhum tipo encontrado"
                  placeholder="Selecione o tipo"
                  value={
                    data?.data?.option
                      ? {
                          label:
                            optionsPerTime.find(
                              (s) => s.value === data.data.option
                            )?.label ?? "",
                          value: data.data.option,
                        }
                      : undefined
                  }
                />
              </label>
              {data?.data?.option === "delayer" && (
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
                                  data: {
                                    ...data.data,
                                    type: propsV.value as TypePerTimeDelayer,
                                  },
                                } as DataNode;
                              }
                              return node;
                            })
                          )
                        }
                        value={
                          data?.data?.type
                            ? {
                                label:
                                  optionsPerTimeDelayer.find(
                                    (v) => v.value === (data.data as any).type
                                  )?.label ?? "",
                                value: data.data.type,
                              }
                            : undefined
                        }
                        options={optionsPerTimeDelayer}
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
                        min={0}
                        style={{
                          height: 38,
                          width: 70,
                        }}
                        fontSize={10}
                        title={`${data.data.value ?? 0} ${
                          optionsPerTimeDelayer.find(
                            (v) => v.value === (data.data as any).type
                          )?.label ?? "Segundos"
                        }`}
                        value={data?.data?.value ?? "0"}
                        onChange={({ target }) => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  data: {
                                    ...data.data,
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
              )}
              {data?.data?.option === "date" && (
                <>
                  <label className="nodrag flex flex-col gap-y-1">
                    <span className="font-semibold">
                      Selecione o tipo de data:
                      <strong className="text-red-500">*</strong>
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
                                data: {
                                  ...dataN.data,
                                  data: {
                                    ...(dataN.data as any).data,
                                    run: propsV.value as TypePerTimeDate,
                                  },
                                },
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                      options={optionsPerTimeDate}
                      isMulti={false}
                      noOptionsMessage="Nenhum tipo encontrado"
                      placeholder="Selecione o tipo"
                      value={
                        data?.data?.data?.run
                          ? {
                              label:
                                optionsPerTimeDate.find(
                                  (s) => s.value === (data.data as any).data.run
                                )?.label ?? "",
                              value: data.data.data.run,
                            }
                          : undefined
                      }
                    />
                  </label>
                  {data?.data?.data?.run === "specificDate" && (
                    <label className="nodrag flex flex-col gap-y-1">
                      <span className="font-semibold">
                        Insira a data abaixo
                        <strong className="text-red-500">*</strong>
                      </span>
                      <Input
                        focusBorderColor="#f6bb0b"
                        borderColor={"#3c3747"}
                        type="datetime-local"
                        value={String(data?.data?.data?.data?.value) ?? ""}
                        name="value"
                        min={moment().format("YYYY-MM-DDTHH:mm")}
                        size={"xs"}
                        autoComplete="off"
                        onChange={({ target }) => {
                          setNodes((nodes) =>
                            nodes.map((node) => {
                              const dataN: DataNode = node.data;
                              if (node.id === id) {
                                node.data = {
                                  ...dataN,
                                  data: {
                                    ...dataN.data,
                                    data: {
                                      ...(dataN.data as any).data,
                                      data: {
                                        ...(dataN.data as any).data.data,
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
                      />
                    </label>
                  )}
                  {data?.data?.data?.run === "dateScheduled" && (
                    <>
                      <label className="nodrag flex flex-col gap-y-1">
                        <span className="font-semibold">
                          Selecione o tipo de data programada:
                          <strong className="text-red-500">*</strong>
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
                                    data: {
                                      ...dataN.data,
                                      data: {
                                        ...(dataN.data as any).data,
                                        data: {
                                          run: propsV.value as TypeRunDateScheduled,
                                        },
                                      },
                                    },
                                  } as DataNode;
                                }
                                return node;
                              })
                            );
                          }}
                          options={optionsRunDateScheduled}
                          isMulti={false}
                          noOptionsMessage="Nenhum tipo encontrado"
                          placeholder="Selecione o tipo"
                          value={
                            data?.data?.data?.data?.run
                              ? {
                                  label:
                                    optionsRunDateScheduled.find(
                                      (s) =>
                                        s.value ===
                                        (data.data as any).data.data.run
                                    )?.label ?? "",
                                  value: data.data.data.data.run,
                                }
                              : undefined
                          }
                        />
                      </label>
                      {data.data.data.data?.run === "nextDayWeek" && (
                        <>
                          <label className="nodrag flex flex-col gap-y-1">
                            <span className="font-semibold text-white/80">
                              Selecione o dia que retorna:
                              <strong className="text-red-500">*</strong>
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
                                        data: {
                                          ...dataN.data,
                                          data: {
                                            ...(dataN.data as any).data,
                                            data: {
                                              ...(dataN.data as any).data.data,
                                              day: Number(propsV.value),
                                            },
                                          },
                                        },
                                      } as DataNode;
                                    }
                                    return node;
                                  })
                                );
                              }}
                              options={daysWeek.map((e, i) => ({
                                label: e,
                                value: i,
                              }))}
                              isMulti={false}
                              noOptionsMessage="Nenhum dia encontrado"
                              placeholder="Selecione o dia"
                              value={
                                data.data.data.data?.day
                                  ? {
                                      label:
                                        daysWeek.find(
                                          (_s, i) =>
                                            i ===
                                            (data.data as any).data.data?.day
                                        ) ?? "",
                                      value: data.data.data.data?.day,
                                    }
                                  : undefined
                              }
                            />
                          </label>
                          <div className="flex gap-2">
                            <label className="nodrag flex flex-col gap-y-1">
                              <span className="font-semibold text-white/80">
                                Das<strong className="text-red-500">*</strong>
                              </span>
                              <Input
                                focusBorderColor="#f6bb0b"
                                borderColor={"#3c3747"}
                                type="time"
                                value={data?.data?.data?.data?.hourA ?? ""}
                                name="value"
                                size={"xs"}
                                autoComplete="off"
                                onChange={({ target }) => {
                                  setNodes((nodes) =>
                                    nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        node.data = {
                                          ...dataN,
                                          data: {
                                            ...dataN.data,
                                            data: {
                                              ...(dataN.data as any).data,
                                              data: {
                                                ...(dataN.data as any).data
                                                  .data,
                                                hourA: target.value,
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
                            </label>
                            <label className="nodrag flex flex-col gap-y-1">
                              <span className="font-semibold text-white/80">
                                Até<strong className="text-red-500">*</strong>
                              </span>
                              <Input
                                focusBorderColor="#f6bb0b"
                                borderColor={"#3c3747"}
                                type="time"
                                value={data?.data?.data?.data?.hourB ?? ""}
                                name="value"
                                size={"xs"}
                                autoComplete="off"
                                onChange={({ target }) => {
                                  setNodes((nodes) =>
                                    nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        node.data = {
                                          ...dataN,
                                          data: {
                                            ...dataN.data,
                                            data: {
                                              ...(dataN.data as any).data,
                                              data: {
                                                ...(dataN.data as any).data
                                                  .data,
                                                hourB: target.value,
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
                            </label>
                          </div>
                        </>
                      )}
                      {data.data.data.data?.run === "nextDay" && (
                        <>
                          <label className="nodrag flex flex-col gap-y-1">
                            <span className="font-semibold text-white/80">
                              Digíte o próximo dia
                              <strong className="text-red-500">*</strong>
                            </span>
                            <Input
                              focusBorderColor="#f6bb0b"
                              borderColor={"#3c3747"}
                              value={data?.data?.data?.data?.day ?? "1"}
                              placeholder="31"
                              max={31}
                              min={1}
                              name="value"
                              size={"xs"}
                              autoComplete="off"
                              onChange={({ target }) => {
                                setNodes((nodes) =>
                                  nodes.map((node) => {
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      node.data = {
                                        ...dataN,
                                        data: {
                                          ...dataN.data,
                                          data: {
                                            ...(dataN.data as any).data,
                                            data: {
                                              ...(dataN.data as any).data.data,
                                              day: target.value.replace(
                                                /\D/g,
                                                ""
                                              )
                                                ? Number(
                                                    target.value.replace(
                                                      /\D/g,
                                                      ""
                                                    )
                                                  ) > 31
                                                  ? 31
                                                  : Number(
                                                      target.value.replace(
                                                        /\D/g,
                                                        ""
                                                      )
                                                    )
                                                : "",
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
                          </label>
                          <div className="flex gap-2">
                            <label className="nodrag flex flex-col gap-y-1">
                              <span className="font-semibold text-white/80">
                                Das<strong className="text-red-500">*</strong>
                              </span>
                              <Input
                                focusBorderColor="#f6bb0b"
                                borderColor={"#3c3747"}
                                type="time"
                                value={data?.data?.data?.data?.hourA ?? ""}
                                name="value"
                                size={"xs"}
                                autoComplete="off"
                                onChange={({ target }) => {
                                  setNodes((nodes) =>
                                    nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        node.data = {
                                          ...dataN,
                                          data: {
                                            ...dataN.data,
                                            data: {
                                              ...(dataN.data as any).data,
                                              data: {
                                                ...(dataN.data as any).data
                                                  .data,
                                                hourA: target.value,
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
                            </label>
                            <label className="nodrag flex flex-col gap-y-1">
                              <span className="font-semibold text-white/80">
                                Até<strong className="text-red-500">*</strong>
                              </span>
                              <Input
                                focusBorderColor="#f6bb0b"
                                borderColor={"#3c3747"}
                                type="time"
                                value={data?.data?.data?.data?.hourB ?? ""}
                                name="value"
                                size={"xs"}
                                autoComplete="off"
                                onChange={({ target }) => {
                                  setNodes((nodes) =>
                                    nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        node.data = {
                                          ...dataN,
                                          data: {
                                            ...dataN.data,
                                            data: {
                                              ...(dataN.data as any).data,
                                              data: {
                                                ...(dataN.data as any).data
                                                  .data,
                                                hourB: target.value,
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
                            </label>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

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
