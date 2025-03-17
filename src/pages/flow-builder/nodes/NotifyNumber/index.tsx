import { useContext, useMemo } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { v4 } from "uuid";
import { InputWhatsAppNumberComponent } from "../../../../components/InputWhatsAppNumber";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { AutoCompleteTextarea } from "../../../../components/TextareaAutoComplete";
import { FlowContext } from "../../../../contexts/flow.context";
import TextareaAutosize from "react-textarea-autosize";
import { AiOutlineNotification } from "react-icons/ai";

interface DataNode {
  numbers: {
    key: string;
    number: string;
  }[];
  text: string;
}

export const NodeNotifyNumber: React.FC<Node> = ({ id }) => {
  const {
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
        icon: AiOutlineNotification,
        label: "Notificar números",
        style: {
          bgColor: "#c34c07",
          color: "#ffffff",
        },
      }}
    >
      <div className="flex flex-col gap-y-2">
        <div
          className="mt-2 flex flex-col gap-2 p-2 pr-1.5"
          style={{
            background: "#1b2435",
            boxShadow: "inset 0 0 3px #0000006c",
          }}
        >
          <div
            style={{
              boxShadow: "0 1px 1px #0707071d",
              background: "#131a27",
            }}
            className="nograd relative grid items-center rounded-lg rounded-tl-none p-1 pr-4"
          >
            <AutoCompleteTextarea
              tokens={{
                "{{": { getOptions: actions.getVariablesReturnValues },
              }}
              value={data.text ?? ""}
              setValue={(value) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = { ...dataN, text: value } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              textareaProps={{
                name: "description",
                autoComplete: "off",
                rows: 3,
                maxRows: 7,
                className: "leading-tight",
                style: {
                  fontSize: 10,
                  background: "#131a27",
                  resize: "none",
                  outline: "none",
                },
                as: TextareaAutosize,
              }}
              placeholder="Digite uma mensagem para enviar aos números"
            />
          </div>
        </div>
        {data.numbers?.length ? (
          <ul className="flex flex-col gap-y-1">
            {data.numbers.map((item) => (
              <li className="flex gap-1 bg-slate-200/10 p-1" key={item.key}>
                <button
                  className="nodrag min-h-full cursor-pointer bg-red-500 duration-200 hover:bg-red-600"
                  onClick={() => {
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const dataN: DataNode = node.data;

                          node.data = {
                            ...dataN,
                            numbers: dataN.numbers.filter(
                              (n) => n.key !== item.key
                            ),
                          } as DataNode;
                        }
                        return node;
                      });
                    });
                  }}
                >
                  <IoMdClose />
                </button>
                <label className="nodrag flex flex-col gap-1">
                  <InputWhatsAppNumberComponent
                    styleInput={{
                      focusBorderColor: "#f6bb0b",
                      borderColor: "#2d3b55",
                      size: "xs",
                      fontSize: 10,
                    }}
                    value={item.number ?? ""}
                    onChange={({ target }) => {
                      setNodes((nodes) => {
                        return nodes?.map((node) => {
                          if (node.id === id) {
                            const dataN: DataNode = node.data;

                            node.data = {
                              ...dataN,
                              numbers: dataN.numbers.map((n) => {
                                if (n.key === item.key) {
                                  n.number = target.value;
                                }
                                return n;
                              }),
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
          <span style={{ fontSize: 10 }} className="text-center">
            Nenhum número será notificado
          </span>
        )}

        <button
          onClick={() => {
            setNodes((nodes) => {
              return nodes?.map((node) => {
                if (node.id === id) {
                  const dataN: DataNode = node.data;
                  const itemId = v4();

                  const newItems = dataN.numbers?.length
                    ? [...dataN.numbers, { key: itemId, number: "" }]
                    : [{ key: itemId, number: "" }];

                  node.data = {
                    ...dataN,
                    numbers: newItems,
                  } as DataNode;
                }
                return node;
              });
            });
          }}
          className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
        >
          <span>Adicionar número</span>
          <IoMdAdd size={14} />
        </button>

        <Handle
          type="target"
          position={Position.Left}
          style={{
            left: -15,
          }}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
        />
        <CustomHandle
          handleId={"main"}
          nodeId={id}
          type="source"
          position={Position.Right}
          style={{ right: -15 }}
          isConnectable={isConnectable}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
