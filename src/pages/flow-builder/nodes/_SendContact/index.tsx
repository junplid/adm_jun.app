import { Input } from "@chakra-ui/react";
import { useContext, useMemo } from "react";
import { AiOutlineFieldTime } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { InputWhatsAppNumberComponent } from "../../../../components/InputWhatsAppNumber";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FaRegAddressCard } from "react-icons/fa";
import { FlowContext } from "../../../../contexts/flow.context";

interface DataNode {
  fullName: string;
  number: string;
  org: string;
  interval: number;
}

export const NodeSendContact: React.FC<Node> = ({ id }) => {
  const {
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
        icon: FaRegAddressCard,
        label: "Enviar contato",
        style: {
          bgColor: "#bb7608",
          color: "#ffffff",
        },
      }}
    >
      <div>
        <div className="mt-2 flex flex-col gap-2 p-2">
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
          <label className="flex flex-col gap-0.5">
            <span className="text-white/90">
              Nome completo
              <strong className="font-semibold text-red-500">*</strong>
            </span>
            <Input
              focusBorderColor="#f6bb0b"
              borderColor={"#354564"}
              size={"xs"}
              name="fullName"
              fontSize={10}
              placeholder="Nome do contato"
              value={data.fullName ?? ""}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        fullName: target.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-white/90">
              Número whatsapp
              <strong className="font-semibold text-red-500">*</strong>
            </span>
            <InputWhatsAppNumberComponent
              styleInput={{
                focusBorderColor: "#f6bb0b",
                borderColor: "#354564",
                size: "xs",
                fontSize: 10,
              }}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        number: target.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              value={data.number ?? ""}
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-white/90">Organização do contato</span>
            <Input
              focusBorderColor="#f6bb0b"
              borderColor={"#354564"}
              size={"xs"}
              name="org"
              fontSize={10}
              placeholder="Organização do contato"
              value={data.org ?? ""}
              onChange={({ target }) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        org: target.value,
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
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
