import { Input, Textarea } from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import { TbTextSize } from "react-icons/tb";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../helpers/fn";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";

type TypeMethods = "get" | "post" | "put" | "delete";

const optionsMethods = [
  { label: "GET", value: "get" },
  { label: "POST", value: "post" },
  { label: "PUT", value: "put" },
  { label: "DELETE", value: "delete" },
];

type DataNode = {
  method: "get" | "post" | "put" | "delete";
  url: string;
  headers?: string;
};

export const NodeWebform: React.FC<Node> = ({ id }) => {
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
        icon: TbTextSize,
        label: "Automação HTTP",
        style: {
          bgColor: "#c34c07",
          color: "#ffffff",
        },
      }}
    >
      <div className="py-2 pb-1">
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex flex-col gap-y-1">
            <span>
              Endereço da URL<strong className="text-red-500">*</strong>
            </span>
            <Input
              focusBorderColor="#f6bb0b"
              borderColor={"#2d3b55"}
              size={"xs"}
              fontSize={10}
              placeholder="Endereço URL"
              onChange={({ target }) => {
                setNodes((nodes) => {
                  return nodes?.map((node) => {
                    if (node.id === id) {
                      const dataN: DataNode = node.data;
                      node.data = {
                        ...dataN,
                        url: target.value,
                      } as DataNode;
                    }
                    return node;
                  });
                });
              }}
              value={data.url ?? ""}
            />
          </label>
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o método
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
                        method: propsV.value as TypeMethods,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              options={optionsMethods}
              isMulti={false}
              noOptionsMessage="Nenhum método encontrado"
              placeholder="Selecione o método"
              value={
                data.method
                  ? {
                      label:
                        optionsMethods.find((s) => s.value === data.method)
                          ?.label ?? "",
                      value: data.method,
                    }
                  : undefined
              }
            />
          </label>
          <label className="nodrag flex flex-col gap-y-1">
            <span>Headers da requisição</span>
            <Textarea
              focusBorderColor={"#f6bb0b"}
              borderColor={"#1a4246"}
              name={"headers"}
              autoComplete={"off"}
              value={
                data.headers ||
                '{\n    suaChave: "VALOR"\n    suaChave: "VALOR"\n}'
              }
              rows={4}
              style={{
                boxShadow: "0 1px 1px #0707071d",
                fontSize: 10,
                background: "#1a4246",
              }}
              resize="none"
              onInput={({ target }) => {
                //@ts-expect-error
                target.style.height = "auto";
                //@ts-expect-error
                target.style.height = target.scrollHeight + 2 + "px";
              }}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        headers: target.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              padding={"2"}
              paddingLeft={"2"}
            />
          </label>
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
