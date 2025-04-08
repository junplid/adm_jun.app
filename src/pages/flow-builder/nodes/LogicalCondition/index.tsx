import { Input } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteInput } from "../../../../components/InputAutoComplete";
import { AiOutlineQuestionCircle } from "react-icons/ai";

type TypesConditions =
  | "has-tag"
  | "numeric-variable"
  | "text-variable"
  | "system-variable";

type TypesMiddlewares = "and" | "or";

type TypeRunNumericVariable =
  | "bigger-than"
  | "less-than"
  | "bigger-or-equal"
  | "less-or-equal"
  | "equal"
  | "not-equal";

type TypeRunTextVariable =
  | "it-is"
  | "its-not"
  | "contains"
  | "not-contain"
  | "starts-with"
  | "end-with"
  | "is-empty";

const optionsTypeMiddle = [
  { label: "E", value: "and" },
  { label: "OU", value: "or" },
];

const optionsTypeCondition = [
  { label: "Possui tag/etiqueta", value: "has-tag" },
  { label: "Variável númerica", value: "numeric-variable" },
  { label: "Variável de texto", value: "text-variable" },
  { label: "Variáveis do sistema", value: "system-variable" },
];

const optionsFormulaNumeric = [
  { label: "Maior que", value: "bigger-than" },
  { label: "Menor que", value: "less-than" },
  { label: "Maior ou igual", value: "bigger-or-equal" },
  { label: "Menor ou igual", value: "less-or-equal" },
  { label: "Igual há", value: "equal" },
  { label: "Diferente de", value: "not-equal" },
];

const optionsFormulaText = [
  { label: "É igual", value: "it-is" },
  { label: "Não é igual", value: "its-not" },
  { label: "Contém", value: "contains" },
  { label: "Não contém", value: "not-contain" },
  { label: "Começa com", value: "starts-with" },
  { label: "Está vazio", value: "is-empty" },
  { label: "Termina com", value: "end-with" },
];

type TypeTextValidate = "cep" | "phone" | "email" | "date";

const optionsTextValidate = [
  { label: "CEP", value: "cep" },
  { label: "Número celular", value: "phone" },
  { label: "E-mail", value: "email" },
  { label: "Data", value: "date" },
];

const optionsSystemValidate = [
  { label: "Horas", value: "hour" },
  { label: "Dia da semana", value: "day-of-week" },
];
const optionsDaysOfWeek = [
  { label: "Segunda-feira", value: "seg" },
  { label: "Terça-feira", value: "ter" },
  { label: "Quarta-feira", value: "qua" },
  { label: "Quinta-feira", value: "qui" },
  { label: "Sexta-feira", value: "sex" },
  { label: "Domingo", value: "dom" },
  { label: "Sábado", value: "sab" },
];

type TypeDayOfWeek = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export type DataNode = {
  exits: { type: "every" | "some" | "all-deny"; key: string }[];
  middlewares: { target: string; source?: string; type?: "and" | "or" }[];
  conditions: ({ key: string } & (
    | { type: "has-tag"; tagOnBusinessId: number }
    | {
        type: "numeric-variable";
        variableId_A: number;
        variableId_B?: number;
        value?: number;
        run:
          | "bigger-than"
          | "less-than"
          | "bigger-or-equal"
          | "less-or-equal"
          | "equal"
          | "not-equal";
      }
    | {
        type: "text-variable";
        run:
          | "contains"
          | "not-contain"
          | "starts-with"
          | "is-empty"
          | "end-with";
        variableOnBusinessId: number;
        value: string; // variavel, regex ou texto
      }
    | {
        type: "text-variable";
        run: "it-is" | "its-not";
        precondition?: "cep" | "phone" | "email" | "date";
        variableOnBusinessId: number;
        value: string; // variavel, regex ou texto
      }
    | {
        type: "system-variable";
        variable: "hour";
        valueOne: string;
        valueTwo: string;
      }
    | {
        type: "system-variable";
        variable: "day-of-week";
        value: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
      }
  ))[];
};

export const NodeLogicalCondition: React.FC<Node> = ({ id }): JSX.Element => {
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
    if (isFirst) {
      if (!options.tags.length) {
        actions.getTags("contactwa");
      }
      if (!options.variables.length) {
        actions.getVariables();
      }
    }
    setIsFirst(true);
  }, [options.tags.length, options.variables.length, isFirst]);

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
        icon: AiOutlineQuestionCircle,
        label: "Condição lógica",
        style: {
          bgColor: "#1a58de",
          color: "#ffffff",
        },
      }}
    >
      <div className="flex flex-col gap-y-1 pt-3">
        <p style={{ fontSize: 9 }}>
          Encadeie condições e envie para 3 saídas: <br />
          <strong className="font-semibold text-green-500">
            Se todas são verdadeiras
          </strong>
          <br />
          <strong className="font-semibold text-red-500">
            Se todas forem falsas
          </strong>
          <br />
          <strong className="font-semibold text-yellow-500">
            Se algumas forem verdadeiras
          </strong>
        </p>
        <div className="my-1 flex flex-col gap-2">
          {data?.conditions?.length ? (
            <ul className="space-y-4">
              {data.conditions.map((con) => (
                <li key={con.key} className="flex w-full flex-col gap-y-1">
                  <label className="flex w-full flex-col gap-0.5">
                    <span style={{ fontSize: 9 }}>
                      Tipo do objeto lógico
                      <strong className="font-semibold text-red-500">*</strong>
                    </span>
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
                                const nextConditions = dataN.conditions.map(
                                  (c) => {
                                    if (c.key === con.key) {
                                      c.type = propsV.value as TypesConditions;
                                    }
                                    return c;
                                  }
                                );
                                let middleClone = structuredClone(
                                  dataN.middlewares
                                );

                                if (middleClone?.length) {
                                  if (
                                    dataN.middlewares?.some(
                                      (m) => m.target !== con.key
                                    )
                                  ) {
                                    middleClone.push({ target: con.key });
                                  }
                                } else {
                                  middleClone = [{ target: con.key }];
                                }

                                node.data = {
                                  ...dataN,
                                  conditions: nextConditions,
                                  middlewares: middleClone,
                                } as DataNode;
                              }
                              return node;
                            })
                          )
                        }
                        value={
                          con.type
                            ? {
                                label:
                                  optionsTypeCondition.find(
                                    (v) => v.value === con.type
                                  )?.label ?? "",
                                value: con.type,
                              }
                            : undefined
                        }
                        options={optionsTypeCondition}
                        isMulti={false}
                        noOptionsMessage="Nenhum tipo encontrado"
                        placeholder="Selecione o tipo"
                      />
                    </div>
                  </label>
                  {con.type && (
                    <>
                      {con.type === "has-tag" && (
                        <div>
                          <label className="flex w-full flex-col gap-0.5">
                            <span style={{ fontSize: 9 }}>
                              Selecione a tag/etiqueta
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
                            </span>
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
                                  setNodes((nodes) => {
                                    return nodes.map((node) => {
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        const nextConditions =
                                          dataN.conditions.map((c) => {
                                            if (c.key === con.key) {
                                              if (c.type === "has-tag") {
                                                c.tagOnBusinessId = Number(
                                                  propsV.value
                                                );
                                              }
                                            }
                                            return c;
                                          });
                                        if (node.id === id) {
                                          node.data = {
                                            ...dataN,
                                            conditions: nextConditions,
                                          } as DataNode;
                                        }
                                      }
                                      return node;
                                    });
                                  })
                                }
                                value={
                                  con.tagOnBusinessId
                                    ? {
                                        label:
                                          options.tags?.find(
                                            (v) => v.id === con.tagOnBusinessId
                                          )?.name ?? "",
                                        value: con.tagOnBusinessId,
                                      }
                                    : undefined
                                }
                                options={options.tags.map((t) => ({
                                  label: t.name,
                                  value: t.id,
                                }))}
                                isMulti={false}
                                noOptionsMessage="Nenhum tipo encontrado"
                                placeholder="Selecione a tag"
                              />
                            </div>
                          </label>
                        </div>
                      )}
                      {con.type === "numeric-variable" && (
                        <div className="flex flex-col">
                          <label className="mb-1 flex w-full flex-col gap-0.5">
                            <span style={{ fontSize: 9 }}>
                              Selecione uma variavel númerica
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
                            </span>
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
                                        const nextConditions =
                                          dataN.conditions.map((c) => {
                                            if (c.key === con.key) {
                                              if (
                                                c.type === "numeric-variable"
                                              ) {
                                                c.variableId_A = Number(
                                                  propsV.value
                                                );
                                              }
                                            }
                                            return c;
                                          });
                                        node.data = {
                                          ...dataN,
                                          conditions: nextConditions,
                                        } as DataNode;
                                      }
                                      return node;
                                    })
                                  )
                                }
                                value={
                                  con.variableId_A
                                    ? {
                                        label:
                                          options.variables?.find(
                                            (v) => v.id === con.variableId_A
                                          )?.name ?? "",
                                        value: con.variableId_A,
                                      }
                                    : undefined
                                }
                                options={options.variables.map((t) => ({
                                  label: t.name,
                                  value: t.id,
                                }))}
                                isMulti={false}
                                noOptionsMessage="Nenhum tipo encontrado"
                                placeholder="Selecione a variável"
                              />
                            </div>
                          </label>
                          <label className="flex w-full flex-col gap-0.5 bg-white/5 p-1 py-2">
                            <span style={{ fontSize: 9 }}>
                              Tipo da formula
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
                            </span>
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
                                        const nextConditions =
                                          dataN.conditions.map((c) => {
                                            if (c.key === con.key) {
                                              if (
                                                c.type === "numeric-variable"
                                              ) {
                                                c.run =
                                                  propsV.value as TypeRunNumericVariable;
                                              }
                                            }
                                            return c;
                                          });
                                        node.data = {
                                          ...dataN,
                                          conditions: nextConditions,
                                        } as DataNode;
                                      }
                                      return node;
                                    })
                                  )
                                }
                                value={
                                  con.run
                                    ? {
                                        label:
                                          optionsFormulaNumeric?.find(
                                            (v) => v.value === con.run
                                          )?.label ?? "",
                                        value: con.run,
                                      }
                                    : undefined
                                }
                                options={optionsFormulaNumeric}
                                isMulti={false}
                                noOptionsMessage="Nenhum tipo encontrado"
                                placeholder="Selecione o tipo"
                              />
                            </div>
                          </label>
                          <div className="flex flex-col gap-y-1 bg-white/5 p-2">
                            {!con.value && (
                              <label className="flex w-full flex-col gap-0.5">
                                <span style={{ fontSize: 9 }}>
                                  Selecione outra variável númerica
                                </span>
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
                                            const nextConditions =
                                              dataN.conditions.map((c) => {
                                                if (c.key === con.key) {
                                                  if (
                                                    c.type ===
                                                    "numeric-variable"
                                                  ) {
                                                    c.variableId_B = Number(
                                                      propsV.value
                                                    );
                                                  }
                                                }
                                                return c;
                                              });
                                            node.data = {
                                              ...dataN,
                                              conditions: nextConditions,
                                            } as DataNode;
                                          }
                                          return node;
                                        })
                                      )
                                    }
                                    value={
                                      con.variableId_B
                                        ? {
                                            label:
                                              options.variables?.find(
                                                (v) => v.id === con.variableId_B
                                              )?.name ?? "",
                                            value: con.variableId_B,
                                          }
                                        : undefined
                                    }
                                    options={options.variables.map((t) => ({
                                      label: t.name,
                                      value: t.id,
                                    }))}
                                    isMulti={false}
                                    noOptionsMessage="Nenhum tipo encontrado"
                                    placeholder="Selecione a variável"
                                  />
                                </div>
                              </label>
                            )}
                            {!con.variableId_B && (
                              <label className="flex w-full flex-col gap-0.5">
                                <span style={{ fontSize: 9 }}>
                                  Valor personalizado alternativo
                                </span>
                                <Input
                                  focusBorderColor="#f6bb0b"
                                  borderColor={"#2d3b55"}
                                  size={"xs"}
                                  type="number"
                                  fontSize={10}
                                  placeholder="0"
                                  onChange={({ target }) =>
                                    setNodes((nodes) =>
                                      nodes.map((node) => {
                                        const dataN: DataNode = node.data;
                                        if (node.id === id) {
                                          const nextConditions =
                                            dataN.conditions.map((c) => {
                                              if (c.key === con.key) {
                                                if (
                                                  c.type === "numeric-variable"
                                                ) {
                                                  c.value = Number(
                                                    target.value
                                                  );
                                                }
                                              }
                                              return c;
                                            });
                                          node.data = {
                                            ...dataN,
                                            conditions: nextConditions,
                                          } as DataNode;
                                        }
                                        return node;
                                      })
                                    )
                                  }
                                  value={con.value ?? ""}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                      {con.type === "text-variable" && (
                        <div className="flex flex-col">
                          <label className="nodrag mb-1 flex w-full flex-col gap-0.5">
                            <span style={{ fontSize: 9 }}>
                              Selecione uma variavel de texto
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
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
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      const nextConditions =
                                        dataN.conditions.map((c) => {
                                          if (c.key === con.key) {
                                            if (c.type === "text-variable") {
                                              c.variableOnBusinessId = Number(
                                                propsV.value
                                              );
                                            }
                                          }
                                          return c;
                                        });
                                      node.data = {
                                        ...dataN,
                                        conditions: nextConditions,
                                      } as DataNode;
                                    }
                                    return node;
                                  })
                                )
                              }
                              value={
                                con.variableOnBusinessId
                                  ? {
                                      label:
                                        options.variables?.find(
                                          (v) =>
                                            v.id === con.variableOnBusinessId
                                        )?.name ?? "",
                                      value: con.variableOnBusinessId,
                                    }
                                  : undefined
                              }
                              options={options.variables.map((t) => ({
                                label: t.name,
                                value: t.id,
                              }))}
                              isMulti={false}
                              noOptionsMessage="Nenhum tipo encontrado"
                              placeholder="Selecione a variável"
                            />
                          </label>
                          <label className="nodrag flex w-full flex-col gap-0.5 bg-white/5 p-1 py-2">
                            <span style={{ fontSize: 9 }}>
                              Tipo da formula
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
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
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      const nextConditions =
                                        dataN.conditions.map((c) => {
                                          if (c.key === con.key) {
                                            if (c.type === "text-variable") {
                                              c.run =
                                                propsV.value as TypeRunTextVariable;
                                            }
                                          }
                                          return c;
                                        });
                                      node.data = {
                                        ...dataN,
                                        conditions: nextConditions,
                                      } as DataNode;
                                    }
                                    return node;
                                  })
                                )
                              }
                              value={
                                con.run
                                  ? {
                                      label:
                                        optionsFormulaText?.find(
                                          (v) => v.value === con.run
                                        )?.label ?? "",
                                      value: con.run,
                                    }
                                  : undefined
                              }
                              options={optionsFormulaText}
                              isMulti={false}
                              noOptionsMessage="Nenhum tipo encontrado"
                              placeholder="Selecione o tipo"
                            />
                          </label>
                          {con.run && (
                            <div className="flex flex-col gap-y-2 bg-white/5 p-2">
                              {con.run === "it-is" || con.run === "its-not" ? (
                                <div className="flex flex-col gap-y-2">
                                  <label className="nodrag flex w-full flex-col gap-0.5">
                                    <span style={{ fontSize: 9 }}>
                                      Prevalidações
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
                                            const dataN: DataNode = node.data;
                                            if (node.id === id) {
                                              const nextConditions =
                                                dataN.conditions.map((c) => {
                                                  if (c.key === con.key) {
                                                    if (
                                                      c.type === "text-variable"
                                                    ) {
                                                      if (
                                                        c.run === "it-is" ||
                                                        c.run === "its-not"
                                                      ) {
                                                        c.precondition =
                                                          propsV.value as TypeTextValidate;
                                                      }
                                                    }
                                                  }
                                                  return c;
                                                });
                                              node.data = {
                                                ...dataN,
                                                conditions: nextConditions,
                                              } as DataNode;
                                            }
                                            return node;
                                          })
                                        )
                                      }
                                      value={
                                        con.precondition
                                          ? {
                                              label:
                                                optionsTextValidate?.find(
                                                  (v) =>
                                                    v.value === con.precondition
                                                )?.label ?? "",
                                              value: con.precondition,
                                            }
                                          : undefined
                                      }
                                      options={optionsTextValidate}
                                      isMulti={false}
                                      noOptionsMessage="Nenhum tipo encontrado"
                                      placeholder="Selecione"
                                    />
                                  </label>
                                  <label className="flex w-full flex-col gap-0.5">
                                    <span style={{ fontSize: 9 }}>
                                      Digite uma RegEx, {"{{"}
                                      variavel{"}}"} ou possivel valor
                                    </span>
                                    <AutoCompleteInput
                                      tokens={{
                                        "{{": {
                                          getOptions:
                                            actions.getVariablesReturnValues,
                                        },
                                      }}
                                      textareaProps={{
                                        focusBorderColor: "#f6bb0b",
                                        borderColor: "#2d3b55",
                                        size: "xs",
                                        fontSize: 10,
                                      }}
                                      setValue={(value) => {
                                        setNodes((nodes) =>
                                          nodes.map((node) => {
                                            const dataN: DataNode = node.data;
                                            if (node.id === id) {
                                              const nextConditions =
                                                dataN.conditions.map((c) => {
                                                  if (c.key === con.key) {
                                                    if (
                                                      c.type ===
                                                        "text-variable" &&
                                                      (c.run === "it-is" ||
                                                        c.run === "its-not")
                                                    ) {
                                                      c.value = value as string;
                                                    }
                                                  }
                                                  return c;
                                                });
                                              node.data = {
                                                ...dataN,
                                                conditions: nextConditions,
                                              } as DataNode;
                                            }
                                            return node;
                                          })
                                        );
                                      }}
                                      placeholder="Digite aqui"
                                      value={con.value || ""}
                                    />
                                  </label>
                                </div>
                              ) : (
                                <label className="flex w-full flex-col gap-0.5">
                                  <span style={{ fontSize: 9 }}>
                                    Digite {"{{"}
                                    variavel{"}}"} ou possivel valor
                                  </span>
                                  <AutoCompleteInput
                                    tokens={{
                                      "{{": {
                                        getOptions:
                                          actions.getVariablesReturnValues,
                                      },
                                    }}
                                    textareaProps={{
                                      focusBorderColor: "#f6bb0b",
                                      borderColor: "#2d3b55",
                                      size: "xs",
                                      fontSize: 10,
                                    }}
                                    setValue={(value) => {
                                      setNodes((nodes) =>
                                        nodes.map((node) => {
                                          const dataN: DataNode = node.data;
                                          if (node.id === id) {
                                            const nextConditions =
                                              dataN.conditions.map((c) => {
                                                if (c.key === con.key) {
                                                  if (
                                                    c.type === "text-variable"
                                                  ) {
                                                    c.value = value as string;
                                                  }
                                                }
                                                return c;
                                              });
                                            node.data = {
                                              ...dataN,
                                              conditions: nextConditions,
                                            } as DataNode;
                                          }
                                          return node;
                                        })
                                      );
                                    }}
                                    placeholder="Digite aqui"
                                    value={con.value ?? ""}
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {con.type === "system-variable" && (
                        <div className="flex flex-col">
                          <label className="nodrag flex w-full flex-col gap-0.5 bg-white/5 p-1 py-2">
                            <span style={{ fontSize: 9 }}>
                              Selecione o tipo de validação
                              <strong className="font-semibold text-red-500">
                                *
                              </strong>
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
                                    const dataN: DataNode = node.data;
                                    if (node.id === id) {
                                      const nextConditions =
                                        dataN.conditions.map((c) => {
                                          if (c.key === con.key) {
                                            if (c.type === "system-variable") {
                                              c.variable = propsV.value as
                                                | "hour"
                                                | "day-of-week";
                                            }
                                          }
                                          return c;
                                        });
                                      node.data = {
                                        ...dataN,
                                        conditions: nextConditions,
                                      } as DataNode;
                                    }
                                    return node;
                                  })
                                )
                              }
                              value={
                                con.variable
                                  ? {
                                      label:
                                        optionsSystemValidate?.find(
                                          (v) => v.value === con.variable
                                        )?.label ?? "",
                                      value: con.variable,
                                    }
                                  : undefined
                              }
                              options={optionsSystemValidate}
                              isMulti={false}
                              noOptionsMessage="Nenhum tipo encontrado"
                              placeholder="Selecione a variável"
                            />
                          </label>
                          {con.variable === "day-of-week" && (
                            <label className="nodrag flex w-full flex-col gap-0.5 bg-white/5 p-2">
                              <span style={{ fontSize: 9 }}>
                                Selecione os dia da semana
                                <strong className="font-semibold text-red-500">
                                  *
                                </strong>
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
                                      const dataN: DataNode = node.data;
                                      if (node.id === id) {
                                        const nextConditions =
                                          dataN.conditions.map((c) => {
                                            if (c.key === con.key) {
                                              if (
                                                c.type === "system-variable"
                                              ) {
                                                if (
                                                  c.variable === "day-of-week"
                                                ) {
                                                  c.value =
                                                    propsV.value as TypeDayOfWeek;
                                                }
                                              }
                                            }
                                            return c;
                                          });
                                        node.data = {
                                          ...dataN,
                                          conditions: nextConditions,
                                        } as DataNode;
                                      }
                                      return node;
                                    })
                                  )
                                }
                                value={
                                  con.variable
                                    ? {
                                        label:
                                          optionsDaysOfWeek?.find(
                                            (v) => v.value === con.value
                                          )?.label ?? "",
                                        value: con.value,
                                      }
                                    : undefined
                                }
                                options={optionsDaysOfWeek}
                                isMulti={false}
                                noOptionsMessage="Nenhum tipo encontrado"
                                placeholder="Selecione a variável"
                              />
                            </label>
                          )}
                          {con.variable === "hour" && (
                            <div className="flex flex-col gap-1 bg-white/5 p-2">
                              <label className="nodrag grid w-full grid-cols-[30px_1fr] items-center gap-0.5">
                                <span style={{ fontSize: 9 }}>
                                  Das:
                                  <strong className="font-semibold text-red-500">
                                    *
                                  </strong>
                                </span>
                                <Input
                                  type="text"
                                  focusBorderColor="#f6bb0b"
                                  borderColor={"#2d3b55"}
                                  size={"xs"}
                                  placeholder="HH:mm"
                                  onChange={({ target }) => {
                                    setNodes((nodes) =>
                                      nodes.map((node) => {
                                        const dataN: DataNode = node.data;
                                        if (node.id === id) {
                                          const nextConditions =
                                            dataN.conditions.map((c) => {
                                              if (c.key === con.key) {
                                                if (
                                                  c.type === "system-variable"
                                                ) {
                                                  if (c.variable === "hour") {
                                                    const valorLimpo =
                                                      target.value.replace(
                                                        /\D/g,
                                                        ""
                                                      );
                                                    if (valorLimpo.length > 2) {
                                                      c.valueOne = valorLimpo
                                                        .replace(
                                                          /(\d{2})/,
                                                          "$1:"
                                                        )
                                                        .slice(0, 5);
                                                    } else {
                                                      c.valueOne = valorLimpo;
                                                    }
                                                  }
                                                }
                                              }
                                              return c;
                                            });
                                          node.data = {
                                            ...dataN,
                                            conditions: nextConditions,
                                          } as DataNode;
                                        }
                                        return node;
                                      })
                                    );
                                  }}
                                  value={con.valueOne}
                                />
                              </label>
                              <label className="nodrag grid w-full grid-cols-[30px_1fr] items-center gap-0.5">
                                <span style={{ fontSize: 9 }}>
                                  Às:
                                  <strong className="font-semibold text-red-500">
                                    *
                                  </strong>
                                </span>
                                <Input
                                  type="text"
                                  focusBorderColor="#f6bb0b"
                                  borderColor={"#2d3b55"}
                                  placeholder="HH:mm"
                                  size={"xs"}
                                  onChange={({ target }) => {
                                    setNodes((nodes) =>
                                      nodes.map((node) => {
                                        const dataN: DataNode = node.data;
                                        if (node.id === id) {
                                          const nextConditions =
                                            dataN.conditions.map((c) => {
                                              if (c.key === con.key) {
                                                if (
                                                  c.type === "system-variable"
                                                ) {
                                                  if (c.variable === "hour") {
                                                    const valorLimpo =
                                                      target.value.replace(
                                                        /\D/g,
                                                        ""
                                                      );
                                                    if (valorLimpo.length > 2) {
                                                      c.valueTwo = valorLimpo
                                                        .replace(
                                                          /(\d{2})/,
                                                          "$1:"
                                                        )
                                                        .slice(0, 5);
                                                    } else {
                                                      c.valueTwo = valorLimpo;
                                                    }
                                                  }
                                                }
                                              }
                                              return c;
                                            });
                                          node.data = {
                                            ...dataN,
                                            conditions: nextConditions,
                                          } as DataNode;
                                        }
                                        return node;
                                      })
                                    );
                                  }}
                                  value={con.valueTwo}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                      {/* <div className="mb-1 mx-auto">
                        <Button
                          colorScheme="red"
                          px={3}
                          size={"xs"}
                          fontSize={9}
                          onClick={() => {
                            setNodes((nodes) =>
                              nodes.map((node) => {
                                const dataN: DataNode = node.data;
                                if (node.id === id) {
                                  const nextKey = nanoid();
                                  const currentMiddle =
                                    data.middlewares?.find(
                                      (mdd) => mdd.target === con.key
                                    );

                                  const cloneCondition = structuredClone(
                                    dataN.conditions
                                  );
                                  const nextMiddle =
                                    dataN.middlewares.map((mdd) => {
                                      if (
                                        mdd.target ===
                                        currentMiddle?.target
                                      ) {
                                        mdd.type =
                                          propsV.value as TypesMiddlewares;
                                        if (!mdd.source) {
                                          mdd.source = nextKey;
                                          cloneCondition.push({
                                            key: nextKey,
                                          } as any);
                                        }
                                      }
                                      return mdd;
                                    });

                                  node.data = {
                                    ...dataN,
                                    middlewares: nextMiddle,
                                    conditions: cloneCondition,
                                  } as DataNode;
                                }
                                return node;
                              })
                            )
                          }}
                        >
                          Deletar condição
                        </Button>
                      </div> */}
                      {data?.middlewares?.find(
                        (mdd) => mdd.target === con.key
                      ) ? (
                        <div style={{ width: 110 }} className="m-auto mt-3">
                          <label className="flex w-full flex-col gap-0.5">
                            <span
                              style={{ fontSize: 9 }}
                              className="text-center font-semibold"
                            >
                              Proxima condição
                            </span>
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
                                        const nextKey = nanoid();
                                        const currentMiddle =
                                          data.middlewares?.find(
                                            (mdd) => mdd.target === con.key
                                          );

                                        const cloneCondition = structuredClone(
                                          dataN.conditions
                                        );
                                        const nextMiddle =
                                          dataN.middlewares.map((mdd) => {
                                            if (
                                              mdd.target ===
                                              currentMiddle?.target
                                            ) {
                                              mdd.type =
                                                propsV.value as TypesMiddlewares;
                                              if (!mdd.source) {
                                                mdd.source = nextKey;
                                                cloneCondition.push({
                                                  key: nextKey,
                                                } as any);
                                              }
                                            }
                                            return mdd;
                                          });

                                        node.data = {
                                          ...dataN,
                                          middlewares: nextMiddle,
                                          conditions: cloneCondition,
                                        } as DataNode;
                                      }
                                      return node;
                                    })
                                  )
                                }
                                value={
                                  data?.middlewares?.find(
                                    (mdd) => mdd.target === con.key
                                  )?.type
                                    ? {
                                        label:
                                          optionsTypeMiddle.find(
                                            (v) =>
                                              v.value ===
                                              data.middlewares!.find(
                                                (mdd) => mdd.target === con.key
                                              )!.type
                                          )?.label ?? "",
                                        value: data.middlewares!.find(
                                          (mdd) => mdd.target === con.key
                                        )!.type as TypesMiddlewares,
                                      }
                                    : undefined
                                }
                                options={optionsTypeMiddle}
                                isMulti={false}
                                noOptionsMessage="Nenhum tipo encontrado"
                                placeholder="Selecione"
                              />
                            </div>
                          </label>
                        </div>
                      ) : undefined}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <button
              onClick={() => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;
                      const key = nanoid();
                      node.data = {
                        ...dataN,
                        ...(dataN?.conditions?.length
                          ? { conditions: [...dataN.conditions, { key }] }
                          : { conditions: [{ key: "0" }] }),
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
              className="bg-green-800 p-2 duration-300 hover:bg-green-700 "
            >
              Iniciar condição lógica
            </button>
          )}
        </div>

        {data.conditions?.length ? (
          <>
            <CustomHandle
              handleId={"green every"}
              nodeId={id}
              type="source"
              position={Position.Right}
              style={{
                top: "50%",
                transform: "translateY(-25px)",
                background: "#22c55e",
                right: -16,
              }}
              isConnectable={isConnectable}
            />
            <CustomHandle
              handleId={"red all-deny"}
              nodeId={id}
              type="source"
              position={Position.Right}
              style={{ top: "50%", background: "#ef4444", right: -16 }}
              isConnectable={isConnectable}
            />
          </>
        ) : undefined}

        {data.conditions?.length > 2 ? (
          <CustomHandle
            handleId={"yellow some"}
            nodeId={id}
            type="source"
            position={Position.Right}
            style={{
              top: "50%",
              transform: "translateY(13px)",
              background: "#eab308",
              right: -16,
            }}
            isConnectable={isConnectable}
          />
        ) : undefined}

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
