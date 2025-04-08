import { Button, Input } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";
import { AutoCompleteInput } from "../../../../components/InputAutoComplete";
import TextareaAutosize from "react-textarea-autosize";
import { AiOutlineMail } from "react-icons/ai";
import { FaPaperclip } from "react-icons/fa";
import prettyBytes from "pretty-bytes";

type DataNode = {
  emailServiceId: number;
  remetent: { name: string; email: string };
  recipients: { key: string; email: string }[];
  subject: string;
  text: string;
  html: string;
  staticFileId: number[];
};

export const NodeEmailSending: React.FC<Node> = ({ id }): JSX.Element => {
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
  const [file, setFile] = useState<any>(null);
  const inputUpload = useRef<any>(null);
  const [loadCreateStatic, setLoadCreateStatic] = useState<boolean>(false);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirstFiles, setIsFirstFiles] = useState(true);
  useEffect(() => {
    if (!options.staticFile.length && isFirstFiles) {
      actions.getStaticFile("file");
      setIsFirstFiles(true);
    }
  }, [options.staticFile.length, isFirstFiles]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.emailServices.length && isFirst) {
      actions.getEmailServices();
      setIsFirst(true);
    }
  }, [options.emailServices.length, isFirst]);

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
      size="260px"
      style={{ bgColor: "#131821", color: "#ffffff" }}
      header={{
        icon: AiOutlineMail,
        label: "Envio de e-mail",
        style: { bgColor: "#ad073c", color: "#ffffff" },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="nopan flex flex-col gap-y-2 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Selecione os serviços de e-mail{" "}
            <strong className="font-semibold text-red-500">*</strong>
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
                      emailServiceId: propsV.value,
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.emailServices.map((e) => ({
              label: e.name,
              value: e.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhum email encontrado"
            placeholder="Selecione o serviço*"
            value={
              data.emailServiceId
                ? {
                    label:
                      options.emailServices.find(
                        (v) => v.id === data.emailServiceId
                      )?.name ?? "",
                    value: data.emailServiceId,
                  }
                : undefined
            }
          />
        </label>

        <div className="flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Remetente
            <strong className="font-semibold text-red-500">*</strong>
          </span>
          <div className="flex flex-col gap-y-2">
            <label>
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#2d3b55"}
                size={"xs"}
                fontSize={10}
                placeholder="Nome do remetente"
                onChange={({ target }) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          remetent: {
                            ...dataN.remetent,
                            name: target.value,
                          },
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
                value={data.remetent?.name ?? ""}
              />
            </label>
            <label>
              <AutoCompleteInput
                tokens={{
                  "{{": { getOptions: actions.getVariablesReturnValues },
                }}
                value={data.remetent?.email ?? ""}
                textareaProps={{
                  focusBorderColor: "#f6bb0b",
                  borderColor: "#2d3b55",
                  size: "xs",
                  fontSize: 10,
                }}
                placeholder={"{{SUA_VARIAVEL}} ou E-mail do remetente"}
                setValue={(email) => {
                  setNodes((nodes) => {
                    return nodes?.map((node) => {
                      if (node.id === id) {
                        const dataN: DataNode = node.data;
                        node.data = {
                          ...dataN,
                          remetent: { ...dataN.remetent, email },
                        } as DataNode;
                      }
                      return node;
                    });
                  });
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Destinatários
            <strong className="font-semibold text-red-500">*</strong>
          </span>
          <div className="flex flex-col gap-y-2">
            {data.recipients?.length ? (
              <ul className="flex flex-col gap-y-1.5">
                {data.recipients?.map((item) => (
                  <li
                    key={item.key}
                    className="flex flex-row-reverse items-center gap-x-2"
                  >
                    <button
                      className="nodrag min-h-full cursor-pointer bg-red-500 duration-200 hover:bg-red-600"
                      onClick={() => {
                        setNodes((nodes) => {
                          return nodes?.map((node) => {
                            if (node.id === id) {
                              const dataN: DataNode = node.data;
                              const newItems = dataN.recipients.filter(
                                (n) => n.key !== item.key
                              );

                              node.data = {
                                ...dataN,
                                recipients: newItems,
                              } as DataNode;
                            }
                            return node;
                          });
                        });
                      }}
                    >
                      <IoMdClose />
                    </button>
                    <label className="w-full">
                      <AutoCompleteInput
                        tokens={{
                          "{{": {
                            getOptions: actions.getVariablesReturnValues,
                          },
                        }}
                        placeholder="Digite o e-mail"
                        value={item.email ?? ""}
                        textareaProps={{
                          focusBorderColor: "#f6bb0b",
                          borderColor: "#2d3b55",
                          size: "xs",
                          fontSize: 10,
                          placeholder: "{{SUA_VARIAVEL}} ou email@email.com",
                        }}
                        setValue={(value) => {
                          setNodes((nodes) => {
                            return nodes?.map((node) => {
                              if (node.id === id) {
                                const dataN: DataNode = node.data;
                                const nextRecipients = dataN.recipients.map(
                                  (n) => {
                                    if (n.key === item.key) {
                                      n.email = value as string;
                                    }
                                    return n;
                                  }
                                );

                                node.data = {
                                  ...dataN,
                                  recipients: nextRecipients,
                                } as DataNode;
                              }
                              return node;
                            });
                          });
                        }}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <i className="text-white/70">
                Adicione pelo menos um destinatário
              </i>
            )}

            <button
              onClick={() => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;

                      node.data = {
                        ...dataN,
                        recipients: dataN.recipients?.length
                          ? [...dataN.recipients, { email: "", key: nanoid() }]
                          : [{ email: "", key: nanoid() }],
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
              className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
            >
              <span>Adicionar novo destinatário</span>
              <IoMdAdd size={14} />
            </button>
          </div>
        </div>

        <label>
          <AutoCompleteInput
            tokens={{
              "{{": { getOptions: actions.getVariablesReturnValues },
            }}
            value={data.subject ?? ""}
            setValue={(value) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;

                    node.data = {
                      ...dataN,
                      subject: value,
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
            textareaProps={{
              focusBorderColor: "#f6bb0b",
              borderColor: "#2d3b55",
              size: "xs",
              fontSize: 10,
            }}
            placeholder="Assunto*"
          />
        </label>

        <label className="flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Texto <strong className="font-semibold text-red-500">*</strong>
            <i className="font-normal text-white/50">
              (se caso o e-mail não suportar HTML, será enviado o texto abaixo)
            </i>
          </span>
          <AutoCompleteTextarea
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
              maxRows: 6,
            }}
            setValue={(value) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = { ...dataN, text: value } as DataNode;
                  }
                  return node;
                });
              });
            }}
            tokens={{ "{{": { getOptions: actions.getVariablesReturnValues } }}
            placeholder="Digite o texto aqui"
            value={data.text ?? ""}
          />
        </label>

        <label className="flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            HTML<strong className="font-semibold text-red-500">*</strong>
          </span>
          <AutoCompleteTextarea
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
              maxRows: 6,
              as: TextareaAutosize,
            }}
            setValue={(value) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = { ...dataN, html: value } as DataNode;
                  }
                  return node;
                });
              });
            }}
            tokens={{ "{{": { getOptions: actions.getVariablesReturnValues } }}
            placeholder="Digite o html aqui"
            value={data.html ?? ""}
          />
        </label>

        <label className="nodrag flex flex-col gap-y-1">
          <span className="flex items-center gap-x-1 font-semibold text-white/80">
            <FaPaperclip /> Selecione os anexos
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
                      staticFileId: propsV.map((t) => Number(t.value)),
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.staticFile.map((st) => ({
              label: st.name,
              value: st.id,
            }))}
            isMulti={true}
            noOptionsMessage="Nenhum anexo encontrado"
            placeholder="Selecione os anexos*"
            value={
              data.staticFileId?.length
                ? data.staticFileId.map((s) => {
                    return {
                      label:
                        options.staticFile.find((sf) => sf.id === s)?.name ??
                        "",
                      value: s,
                    };
                  })
                : undefined
            }
          />
        </label>
        <div className="flex flex-col gap-y-1 bg-slate-300/10 p-1">
          {!file && (
            <span
              style={{ fontSize: 9 }}
              className="w-full text-center leading-tight text-white/90"
            >
              Faça o upload de um novo anexo
            </span>
          )}
          {file && (
            <div className="flex flex-col items-start gap-y-0.5">
              <a
                style={{ fontSize: 9 }}
                className="line-clamp-2 font-medium leading-none text-slate-100"
              >
                {file.name}
              </a>
              <a
                style={{ fontSize: 9 }}
                className="text-xs font-light leading-none text-slate-100"
              >
                tamanho: {prettyBytes(file.size)}
              </a>
            </div>
          )}
          <Input
            onChange={({ target }) => setFile(target.files?.[0])}
            ref={inputUpload}
            hidden
            type="file"
            size={"xs"}
          />
          <Button
            className="nodrag nopan"
            type="button"
            colorScheme="green"
            size={"xs"}
            isLoading={loadCreateStatic}
            onClick={async () => {
              if (file) {
                setLoadCreateStatic(true);
                await actions.createStaticFile("file", file, (newFile) => {
                  setFile(null);
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === id) {
                        node.data = {
                          ...node.data,
                          staticFileId: newFile.id,
                        };
                      }
                      return node;
                    })
                  );
                });
                setLoadCreateStatic(false);
                return;
              }
              inputUpload.current.click();
            }}
          >
            <span className="w-full flex-wrap" style={{ fontSize: 10 }}>
              {file ? "Salvar novo arquivo" : "Carregar arquivo"}
            </span>
          </Button>
        </div>

        {/* <div className="flex flex-col nodrag gap-y-1">
          <label htmlFor="file-upload" className="font-semibold text-white/80">
            Selecione os anexos
          </label>

          <input
            id="file-upload"
            type="file"
            multiple
            style={{ display: "none" }}
            hidden
            onChange={handleFileChange}
          />

          {data.attachments?.length > 0 && (
            <ul className="flex nodrag cursor-auto flex-col gap-y-1">
              {data.attachments.map((file) => (
                <li
                  key={file.key}
                  className="grid group grid-cols-[1fr_10px] cursor-pointer items-center p-1 py-0.5 hover:bg-white/5 duration-200"
                  onClick={() =>
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const dataN: DataNode = node.data;
                          node.data = {
                            ...dataN,
                            attachments: dataN.attachments.filter(
                              (f) => f.key !== file.key
                            ),
                          } as DataNode;
                        }
                        return node;
                      });
                    })
                  }
                >
                  <span>{file.file.name}</span>
                  <button
                    style={{ height: 10 }}
                    className="text-white group-hover:text-red-500 duration-200"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div> */}

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{ top: "30%", left: -15 }}
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
