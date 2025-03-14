import { Input, Textarea } from "@chakra-ui/react";
import { useMemo } from "react";
import { AiOutlineFieldTime, AiOutlineSend } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
// import { CustomHandle } from "../../helpers/fn";
import { PatternNode } from "../Pattern";
import TextareaAutosize from "react-textarea-autosize";

interface DataNode {
  message: string;
  interval: number;
}

export const NodeMessage: React.FC<Node> = ({ id }) => {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  return (
    <PatternNode.PatternContainer
      style={{ bgColor: "#131821", color: "#ffffff" }}
      header={{
        icon: AiOutlineSend,
        label: "Envio de texto",
        style: { bgColor: "#09900b", color: "#ffffff" },
      }}
    >
      <div>
        <div
          className="mt-2 flex flex-col gap-2 p-2 pr-1.5"
          style={{
            background: "#1b2435",
            boxShadow: "inset 0 0 3px #0000006c",
          }}
        >
          <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2">
            <span style={{ fontSize: 9 }}>Digitando...</span>
            <div className="flex items-center gap-2">
              <Input
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
                  const { nodeInternals } = store.getState();
                  const arrayNodes = Array.from(nodeInternals.values());
                  setNodes(
                    arrayNodes.map((node) => {
                      if (node.id === id) {
                        node.data = { ...node.data, interval: target.value };
                      }
                      return node;
                    })
                  );
                }}
              />
              <AiOutlineFieldTime size={18} />
            </div>
          </label>
          <div className="nograd relative grid items-center">
            <Textarea
              borderColor={"#1a4246"}
              name={"description"}
              autoComplete={"off"}
              as={TextareaAutosize}
              rows={8}
              style={{
                boxShadow: "0 1px 1px #0707071d",
                fontSize: 10,
                background: "#1a4246",
              }}
              padding={"2"}
              paddingLeft={"2"}
              resize={"none"}
              placeholder="Digite a mensagem aqui"
              value={data.message ?? ""}
              onChange={({ target }) => {
                const { nodeInternals } = store.getState();
                const arrayNodes = Array.from(nodeInternals.values());
                setNodes(
                  arrayNodes.map((node) => {
                    if (node.id === id) {
                      node.data = { ...node.data, message: target.value };
                    }
                    return node;
                  })
                );
              }}
            />
          </div>
        </div>

        <div className="pointer-events-none fixed -bottom-4 left-1/2 -translate-x-1/2 rounded-sm bg-white/5 px-1 text-white/60">
          <span className="tracking-widest" style={{ fontSize: 7 }}>
            {id}
          </span>
        </div>

        <Handle type="target" position={Position.Left} style={{ left: -15 }} />
        {/* <CustomHandle
          handleId={"main"}
          nodeId={id}
          type="source"
          position={Position.Right}
          style={{ right: -15 }}
        /> */}

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
