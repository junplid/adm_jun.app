import { Button, Input } from "@chakra-ui/react";
import prettyBytes from "pretty-bytes";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineFieldTime, AiOutlineVideoCamera } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import TextareaAutosize from "react-textarea-autosize";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";

interface DataNode {
  staticFileId: number;
  interval?: number;
  message?: string;
}

export const NodeSendVideo: React.FC<Node> = ({ id }) => {
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

  const [loadCreateStatic, setLoadCreateStatic] = useState<boolean>(false);
  const [file, setFile] = useState<any>(null);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  // useEffect(() => {
  //   if (file) {
  //     const files = file;
  //     // console.log(files);
  //   }
  // }, [file]);

  const inputUpload = useRef<any>(null);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.staticVideos.length && isFirst) {
      actions.getStaticFile("video");
      setIsFirst(true);
    }
  }, [options.staticVideos.length, isFirst]);

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
      style={{ bgColor: "#131821", color: "#ffffff" }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineVideoCamera,
        label: "Enviar vídeo",
        style: { bgColor: "#bb7608", color: "#ffffff" },
      }}
    >
      <div>
        <div className="mt-2 flex flex-col gap-2 p-2">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o vídeo
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
              options={options.staticVideos.map((st) => ({
                label: st.name,
                value: st.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhum vídeo encontrado"
              placeholder="Selecione o vídeo*"
              value={
                data.staticFileId
                  ? {
                      label:
                        options.staticVideos.find(
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
                  Faça o upload do novo vídeo abaixo para salvar no banco de
                  dados
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
              accept="video/mp4"
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
                  await actions.createStaticFile("video", file, (newFile) => {
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
                {file ? "Salvar novo vídeo" : "Carregar vídeo"}
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
              textareaProps={{
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
                as: TextareaAutosize,
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
