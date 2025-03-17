import { Button, Input } from "@chakra-ui/react";
import prettyBytes from "pretty-bytes";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineFieldTime, AiOutlinePicture } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";
import TextareaAutosize from "react-textarea-autosize";

interface DataNode {
  staticFileId?: number;
  interval?: number;
  message?: string;
  linkImage?: string;
}

export const NodeSendImage: React.FC<Node> = ({ id }) => {
  const {
    actions,
    options,
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  const [loadCreateStatic, setLoadCreateStatic] = useState<boolean>(false);
  const [file, setFile] = useState<any>(null);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const inputUpload = useRef<any>(null);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.staticImage.length && isFirst) {
      actions.getStaticFile("image");
      setIsFirst(true);
    }
  }, [options.staticImage.length, isFirst]);

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
        icon: AiOutlinePicture,
        label: "Enviar imagem",
        style: {
          bgColor: "#bb7608",
          color: "#ffffff",
        },
      }}
    >
      <div>
        <div className="mt-2 flex flex-col gap-2 p-2">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">Link da imagem</span>
            <Input
              placeholder="Insira o link da imagem"
              fontSize={"xx-small"}
              size={"xs"}
              focusBorderColor="#f6bb0b"
              borderColor={"#354564"}
              value={data.linkImage ?? ""}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        linkImage: target.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
            />
          </label>
          <span className="text-center font-semibold text-white/60">OU</span>
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione a imagem
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
                        staticFileId: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={options.staticImage.map((st) => ({
                label: st.name,
                value: st.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhuma imagem encontrado"
              placeholder="Selecione a imagem*"
              value={
                data.staticFileId
                  ? {
                      label:
                        options.staticImage.find(
                          (v) => v.id === data.staticFileId
                        )?.name ?? "",
                      value: data.staticFileId,
                    }
                  : undefined
              }
            />
          </label>
          <div className="flex flex-col gap-y-2 bg-slate-300/10 p-1">
            {!file && (
              <div className="flex gap-1 bg-yellow-600/60 p-1">
                <span
                  style={{ fontSize: 9 }}
                  className="leading-tight text-white/90"
                >
                  Faça o upload de uma nova imagem abaixo para salvar no banco
                  de dados
                </span>
              </div>
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
              accept="image/*"
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
                  await actions.createStaticFile("image", file, (newFile) => {
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
                {file ? "Salvar nova imagem" : "Carregar imagem"}
              </span>
            </Button>
          </div>
          {data.message?.length ? (
            <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2">
              <span style={{ fontSize: 9 }}>Digitando...</span>
              <div className="flex items-center gap-2">
                <Input
                  focusBorderColor="#f6bb0b"
                  borderColor={"#354564"}
                  size={"xs"}
                  width={"14"}
                  type="number"
                  min={0}
                  fontSize={10}
                  title={`${data.interval ?? 0} Segundos`}
                  value={data.interval ?? "0"}
                  onChange={({ target }) => {
                    setNodes((nodes) =>
                      nodes.map((node) => {
                        const dataN: DataNode = node.data;
                        if (node.id === id) {
                          node.data = {
                            ...dataN,
                            interval: Number(target.value),
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
          ) : undefined}
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">Envie mensagem</span>
            <AutoCompleteTextarea
              tokens={{
                "{{": { getOptions: actions.getVariablesReturnValues },
              }}
              setValue={(value) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === id) {
                      node.data = {
                        ...node.data,
                        message: value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              textareaProps={{
                as: TextareaAutosize,
                focusBorderColor: "#f6bb0b",
                borderColor: "#1a2538",
                padding: "2",
                paddingLeft: 2,
                resize: "none",
                className:
                  "p-1 pr-4 leading-tight rounded-lg rounded-tl-none nodrag",
                style: {
                  boxShadow: "0 1px 1px #0707071d",
                  fontSize: 10,
                  background: "#131a27",
                },
              }}
              value={data.message ?? ""}
              placeholder="Digite a mensagem aqui"
            />
          </label>
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{ left: -15 }}
          position={Position.Left}
        />
        <CustomHandle
          handleId={"main"}
          nodeId={id}
          type="source"
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
