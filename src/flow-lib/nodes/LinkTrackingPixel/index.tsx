import { Input, Textarea } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineFieldTime, AiOutlineSearch } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";

type DataNode = {
  linkTackingPixelId: number;
  text: string;
  interval: number;
};

export const NodeLinkTranckingPixel: React.FC<Node> = ({ id }): JSX.Element => {
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
    if (!options.linksTrackingPixel.length && isFirst) {
      actions.getLinksTrackingPixel();
      setIsFirst(true);
    }
  }, [options.linksTrackingPixel.length, isFirst]);

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
        bgColor: "#121418",
        color: "#ffffff",
      }}
      header={{
        icon: AiOutlineSearch,
        label: "Link de rastreio Pixel",
        style: {
          bgColor: "#9e4964",
          color: "#ffffff",
        },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="nopan flex flex-col gap-y-2 px-1 py-2 pb-1">
        <label className="nodrag flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Selecione o link
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
                      linkTackingPixelId: propsV.value,
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            options={options.linksTrackingPixel.map((e) => ({
              label: e.name,
              value: e.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhum link encontrado"
            placeholder="Selecione o link*"
            value={
              data.linkTackingPixelId
                ? {
                    label:
                      options.linksTrackingPixel.find(
                        (v) => v.id === data.linkTackingPixelId
                      )?.name ?? "",
                    value: data.linkTackingPixelId,
                  }
                : undefined
            }
          />
        </label>

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
              title={`${
                store.getState().nodeInternals.get(id)?.data.interval ?? 0
              } Segundos`}
              value={
                store.getState().nodeInternals.get(id)?.data.interval ?? "0"
              }
              onChange={({ target }) => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;
                      node.data = {
                        ...dataN,
                        interval: Number(target.value),
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
            />
            <AiOutlineFieldTime size={18} />
          </div>
        </label>
        <div className="nograd relative grid items-center">
          <Textarea
            focusBorderColor={"#f6bb0b"}
            borderColor={"#1a4246"}
            name={"description"}
            autoComplete={"off"}
            value={data.text ?? ""}
            rows={3}
            className={
              "nodrag rounded-lg rounded-tl-none p-1 pr-4 leading-tight"
            }
            style={{
              boxShadow: "0 1px 1px #0707071d",
              fontSize: 10,
              background: "#1a4246",
            }}
            resize="none"
            placeholder={"Use {link} para imprimir o link selecionado no texto"}
            onInput={({ target }) => {
              //@ts-expect-error
              target.style.height = "auto";
              //@ts-expect-error
              target.style.height = target.scrollHeight + 2 + "px";
            }}
            onChange={({ target }) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = {
                      ...dataN,
                      text: target.value,
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
            padding={"2"}
            paddingLeft={"2"}
          />
        </div>

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
          style={{ top: "30%", right: -15 }}
          isConnectable={isConnectable}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
