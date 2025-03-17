import {
  Button,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteInput } from "../../../../components/InputAutoComplete";
import { CustomHandle } from "../../customs/node";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { FaFontAwesomeFlag } from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";

const optinsValidateReply = [
  { label: "Qualquer texto", value: "text" },
  { label: "Número", value: "number" },
  { label: "RegEX", value: "regex" },
  { label: "Valor exato", value: "value" },
  { label: "Telefone", value: "tel" },
  { label: "E-mail", value: "email" },
  { label: "Nome completo(NÃO)", value: "full_name" },
  { label: "CNPJ", value: "cnpj" },
  { label: "CPF", value: "cpf" },
  { label: "Endereço(NÃO)", value: "address" },
  { label: "Cidade", value: "city" },
  { label: "Estado", value: "state" },
  { label: "CEP", value: "cep" },
  { label: "Hora(NÃO)", value: "hour" },
  { label: "Dia da semana", value: "weekday" },
  { label: "Mídia(NÃO)", value: "midia" },
  { label: "Intervalo de números(NÃO)", value: "range_numbers" },
];

type TypeValidate =
  | "tel"
  | "cnpj"
  | "regex"
  | "value"
  | "cpf"
  | "text"
  | "email"
  | "full_name"
  | "address"
  | "city"
  | "state"
  | "cep"
  | "hour"
  | "weekday"
  | "midia"
  | "range_numbers";

interface DataNode {
  variableId: number;
  type?: TypeValidate;
  customValidate?: string;
  value?: string;
  flags?: string[];
  // validateReply?: {
  //   // attempts: number;
  //   // messageErrorAttempts?: { interval: number; value: string };
  //   // failedAttempts?: {
  //   //   interval: number;
  //   //   value: string;
  //   //   action: TypeActions;
  //   //   submitFlowId?: number;
  //   // };
  // };
}

export const NodeValidation: React.FC<Node> = ({ id }): JSX.Element => {
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

  const [loadCreateVariable, setLoadCreateVariable] = useState<boolean>(false);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

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
      size="230px"
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineCheckCircle,
        label: "Validação",
        style: { bgColor: "#2eaf30", color: "#ffffff" },
      }}
    >
      <div className="nopan flex flex-col px-1">
        <div className="flex flex-col gap-y-2 py-3">
          <span>
            <strong className="text-red-500">ATENÇÃO!</strong> variaveis com
            valor diferente que pertecem a varios negocios irá validar caso
            apenas um valor seja verdadeiro
          </span>
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione a variável
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
              placeholder="Selecione a variável*"
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
          <label className="nodrag flex flex-col gap-y-1">
            <span className=" text-white/80">Selecione uma pré-validação</span>
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
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        type: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              options={optinsValidateReply}
              isMulti={false}
              noOptionsMessage="Nenhuma validação encontrada"
              placeholder="Selecione a validação"
              value={
                data?.type
                  ? {
                      label:
                        optinsValidateReply.find((v) => v.value === data?.type)
                          ?.label ?? "",
                      value: data?.type,
                    }
                  : undefined
              }
            />
          </label>
          {data.type === "regex" && (
            <div className="nodrag flex w-full flex-col gap-0.5">
              <span className="text-white/80">Digite uma RegEx</span>
              <div className="flex items-center gap-1">
                <label className="nodrag flex w-full flex-col gap-0.5">
                  <div className="flex items-center">
                    <InputGroup size={"xs"}>
                      <InputLeftAddon
                        borderWidth={0}
                        p={"2px"}
                        pl={0}
                        bg={"transparent"}
                      >
                        /
                      </InputLeftAddon>
                      <AutoCompleteInput
                        tokens={{
                          "{{": {
                            getOptions: actions.getVariablesReturnValues,
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
                                node.data = {
                                  ...dataN,
                                  customValidate: value,
                                } as DataNode;
                              }
                              return node;
                            })
                          );
                        }}
                        placeholder="Digite aqui"
                        value={data.customValidate ?? ""}
                      />
                      <InputRightAddon
                        p={"2px"}
                        pr={0}
                        borderWidth={0}
                        bg={"transparent"}
                      >
                        /{data.flags ?? ""}
                      </InputRightAddon>
                    </InputGroup>
                  </div>
                </label>
                <Menu colorScheme="facebook" size="xs" closeOnSelect={false}>
                  {({ isOpen }) => {
                    return (
                      <>
                        <MenuButton
                          border={"none"}
                          bg={"transparent"}
                          fontWeight={"300"}
                          fontSize={10}
                          gap={2}
                          py={0}
                          px={"7px"}
                          size={"xs"}
                          height={"24px"}
                          _hover={{ bg: "transparent" }}
                          _active={{ bg: "#202029" }}
                          color={isOpen ? "white" : "#D1D1DB"}
                          as={Button}
                          colorScheme="blue"
                          rightIcon={
                            isOpen ? (
                              <MdKeyboardArrowUp size={15} />
                            ) : (
                              <MdKeyboardArrowDown size={15} />
                            )
                          }
                        >
                          <FaFontAwesomeFlag size={12} />
                        </MenuButton>
                        <MenuList
                          color={"#f3f3f3"}
                          borderColor={"#3F3F50"}
                          bg={"#202029"}
                          minW={"130px"}
                          padding={"2px"}
                        >
                          <MenuOptionGroup
                            onChange={(value) => {
                              setNodes((nodes) =>
                                nodes.map((node) => {
                                  const dataN: DataNode = node.data;
                                  if (node.id === id) {
                                    node.data = {
                                      ...dataN,
                                      flags: value,
                                    } as DataNode;
                                  }
                                  return node;
                                })
                              );
                            }}
                            mt={"0px"}
                            type="checkbox"
                          >
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              icon={null}
                              value="g"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("g") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}

                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Global
                                </span>
                              </div>
                            </MenuItemOption>
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              // value={String(column.id)}
                              icon={null}
                              value="i"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("i") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}
                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Case insensitive
                                </span>
                              </div>
                            </MenuItemOption>
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              // value={String(column.id)}
                              icon={null}
                              value="m"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("m") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}
                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Multiline
                                </span>
                              </div>
                            </MenuItemOption>
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              // value={String(column.id)}
                              icon={null}
                              value="s"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("s") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}
                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Single line
                                </span>
                              </div>
                            </MenuItemOption>
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              // value={String(column.id)}
                              icon={null}
                              value="u"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("u") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}
                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Unicode
                                </span>
                              </div>
                            </MenuItemOption>
                            <MenuItemOption
                              bg={"#202029"}
                              _hover={{ bg: "#292935" }}
                              fontSize={13}
                              p={"0px"}
                              // value={String(column.id)}
                              icon={null}
                              value="y"
                            >
                              <div className="flex items-center gap-1">
                                {data.flags?.includes("y") ? (
                                  <MdCheckBox size={14} />
                                ) : (
                                  <MdCheckBoxOutlineBlank size={14} />
                                )}
                                <span
                                  className="py-2 leading-none"
                                  style={{ fontSize: 9 }}
                                >
                                  Sticky
                                </span>
                              </div>
                            </MenuItemOption>
                          </MenuOptionGroup>
                        </MenuList>
                      </>
                    );
                  }}
                </Menu>
              </div>
            </div>
          )}
          {data.type === "value" && (
            <label className="nodrag flex w-full flex-col gap-0.5">
              <span className="text-white/80">Possivel valor exato</span>
              <AutoCompleteInput
                tokens={{
                  "{{": {
                    getOptions: actions.getVariablesReturnValues,
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
                        node.data = {
                          ...dataN,
                          value,
                        } as DataNode;
                      }
                      return node;
                    })
                  );
                }}
                placeholder="Digite aqui"
                value={data.value ?? ""}
              />
            </label>
          )}
          {/* <div className="flex flex-col gap-y-1">
            <div className="flex flex-col gap-y-1">
              <span className="text-white/90">
                Enviar mensagem de erro se a resposta estiver inválida
              </span>
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-2">
                  <label className="flex items-center justify-between gap-2 p-2 py-1 border border-dashed rounded-lg border-slate-700">
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
                          data.validateReply?.messageErrorAttempts
                            ?.interval ?? 2
                        } Segundos`}
                        value={
                          data.validateReply?.messageErrorAttempts
                            ?.interval ?? "2"
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
                  <div className="grid items-center flex-1 h-full">
                    <AutoCompleteTextarea
                      tokens={{
                        "{{": {
                          getOptions: actions.getVariablesReturnValues,
                        },
                      }}
                      placeholder="Digite a mensagem aqui"
                      textareaProps={{
                        rows: 1,
                        maxRows: 8,
                        className:
                          "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                        style: {
                          boxShadow: "0 1px 1px #0707071d",
                          fontSize: 10,
                          background: "#131a27",
                          resize: "none",
                          border: "#34425a",
                        },
                        as: TextareaAutosize,
                        onHeightChange: (n: number) => {
                          setHTextAMsgError(n);
                        },
                      }}
                      value={
                        data.validateReply?.messageErrorAttempts?.value ?? ""
                      }
                      setValue={(value) => {
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
                                    value,
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
                </div>
              </div>
            </div> 
          </div>*/}
          {/* <div className="flex flex-col gap-y-1">
            <div>
              <button
                className="py-2 w-full flex items-center justify-between"
                {...getTogglePropsAttempts()}
                style={{ fontSize: 11 }}
              >
                <span className="font-semibold">- Tentativas</span>
                {isExpandedAttempts ? (
                  <IoChevronUpOutline size={14} />
                ) : (
                  <IoChevronDownOutline size={14} />
                )}
              </button>
            </div>
            <div {...getCollapsePropsAttempts()} className="flex flex-col">
              <div className="flex mb-2 items-center justify-between gap-x-2">
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
              <div className="flex flex-col pb-3 gap-y-2 bg-slate-800/50">
                <i className="p-2 text-white/90">
                  Após esgotar as tentativas envie uma mensagem e tome uma
                  decisão
                </i>
                <div className="flex flex-col px-2 gap-y-2">
                  <label className="flex items-center justify-between gap-2 p-2 py-1 border border-dashed rounded-lg border-slate-700">
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
                          data.validateReply?.failedAttempts?.interval ?? "2"
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
                  <div className="grid items-center flex-1 h-full">
                    <AutoCompleteTextarea
                      tokens={{
                        "{{": {
                          getOptions: actions.getVariablesReturnValues,
                        },
                      }}
                      setValue={(value) => {
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
                                    value,
                                  },
                                },
                              } as DataNode;
                            }
                            return node;
                          })
                        );
                      }}
                      value={data.validateReply?.failedAttempts?.value ?? ""}
                      placeholder="Digite a mensagem aqui"
                      textareaProps={{
                        rows: 1,
                        maxRows: 8,
                        className:
                          "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                        style: {
                          boxShadow: "0 1px 1px #0707071d",
                          fontSize: 10,
                          background: "#131a27",
                          resize: "none",
                          border: "#34425a",
                        },
                        as: TextareaAutosize,
                        onHeightChange: (n: number) => setHTextAAttempts(n),
                      }}
                    />
                  </div>
                </div>
                <RadioGroup>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col px-2 gap-y-2">
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
                        <div className="px-2 mt-0.5 nodrag">
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
                                          submitFlowId: Number(propsV.value),
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
                                          data?.validateReply?.failedAttempts
                                            ?.submitFlowId
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
                    <label className="relative p-2 cursor-pointer bg-orange-500/25">
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
                    </label>
                    <label className="flex px-2 gap-x-2">
                      <Radio
                        size={"sm"}
                        colorScheme="green"
                        isChecked={
                          data.validateReply?.failedAttempts?.action ===
                          "CONTINUE"
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
                                      ...dataN.validateReply?.failedAttempts,
                                      action: "CONTINUE",
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
                    <label className="flex px-2 gap-x-2">
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
                                      ...dataN.validateReply?.failedAttempts,
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
          </div> */}
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          position={Position.Left}
          style={{ top: "30%", left: -15 }}
        />
        <CustomHandle
          nodeId={id}
          handleId="green sucess"
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
        {/* <Handle
          type="source"
          id="main"
          position={Position.Right}
          style={{ top: "45%", right: -15 }}
        /> */}

        <CustomHandle
          nodeId={id}
          handleId="red fail"
          type="source"
          position={Position.Right}
          style={{
            top: "50%",
            background: "#ef4444",
            right: -16,
          }}
          isConnectable={isConnectable}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
