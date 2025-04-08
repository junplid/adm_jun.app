import { Input } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdOutlineAdd } from "react-icons/md";
import { Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { nanoid } from "nanoid";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { BsSignStop } from "react-icons/bs";

interface DataNode {
  items: {
    activators: { value: string; key: string }[];
    exit: string;
    key: string;
  }[];
}

export const NodeInterruption: React.FC<Node> = ({ id }): JSX.Element => {
  const { setNodes, setEdges } = useReactFlow();
  const store = useStoreApi();
  const [fieldsActivator, setFieldsActivator] = useState<{
    [x: string]: string;
  }>({} as { [x: string]: string });

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  return (
    <PatternNode.PatternContainer
      size="230px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      header={{
        icon: BsSignStop,
        label: "Interrupção",
        style: {
          bgColor: "#5d0888",
          color: "#ffffff",
        },
      }}
    >
      <div className="nopan flex flex-col gap-y-3 px-1 pb-1">
        <div className="my-1 flex flex-col gap-2">
          <p>
            Adicione palavras-chave que o lead pode enviar a qualquer momento
            para alterar o caminho do fluxo
          </p>
          <ul className="nodrag cursor-default space-y-1">
            {data?.items?.map((item) => (
              <li
                key={item.key}
                className="relative flex gap-1 bg-slate-200/10 p-1 pr-5"
              >
                <button
                  className="nodrag min-h-full cursor-pointer bg-red-500 duration-200 hover:bg-red-600"
                  onClick={() => {
                    setNodes((nodes) => {
                      return nodes?.map((node) => {
                        if (node.id === id) {
                          const dataN: DataNode = node.data;
                          const newItems = dataN.items
                            .filter((i) => {
                              if (i.key !== item.key) return true;
                              setEdges((edges) =>
                                edges.filter(
                                  ({ source, sourceHandle }) =>
                                    !(source === id && sourceHandle === i.key)
                                )
                              );
                              return false;
                            })
                            .map((ni, indice) => {
                              ni.activators.shift();
                              const activator = String(indice + 1);
                              const newActivadors = [
                                { value: activator, key: nanoid() },
                                ...ni.activators,
                              ];
                              return { ...ni, activators: newActivadors };
                            });

                          node.data = {
                            ...dataN,
                            items: newItems,
                          } as DataNode;
                        }
                        return node;
                      });
                    });
                  }}
                >
                  <IoMdClose />
                </button>
                <div>
                  <div className="mt-1 flex flex-col gap-1">
                    {item.activators.length > 1 ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">Ativadores:</span>
                        <div className="w-full">
                          <span className="nodrag flex flex-wrap">
                            {item.activators.map(
                              (act, indice) =>
                                indice > 0 && (
                                  <span
                                    key={act.key}
                                    className="cursor-pointer px-1 duration-200 hover:bg-red-500"
                                    onClick={() => {
                                      setNodes((nodes) => {
                                        return nodes?.map((node) => {
                                          if (node.id === id) {
                                            const dataN: DataNode = node.data;
                                            const newItems = dataN.items.map(
                                              (it) => {
                                                if (it.key === item.key) {
                                                  const newActivator =
                                                    it.activators.filter(
                                                      (acti) =>
                                                        acti.key !== act.key
                                                    );
                                                  it.activators = newActivator;
                                                }
                                                return it;
                                              }
                                            );

                                            node.data = {
                                              ...dataN,
                                              items: newItems,
                                            } as DataNode;
                                          }
                                          return node;
                                        });
                                      });
                                    }}
                                  >
                                    {act.value}
                                  </span>
                                )
                            )}
                          </span>
                        </div>
                      </div>
                    ) : undefined}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setNodes((nodes) => {
                          return nodes?.map((node) => {
                            if (node.id === id) {
                              const dataN: DataNode = node.data;
                              const newItems = dataN.items.map((it) => {
                                if (it.key === item.key) {
                                  const isAlreadyExist = it.activators.some(
                                    (acti) =>
                                      acti.value === fieldsActivator[item.key]
                                  );
                                  if (!isAlreadyExist) {
                                    it.activators.push({
                                      key: nanoid(),
                                      value: fieldsActivator[item.key],
                                    });
                                  } else {
                                    alert(
                                      `O ativador: ${
                                        fieldsActivator[item.key]
                                      } já existe!`
                                    );
                                  }
                                }
                                return it;
                              });

                              node.data = {
                                ...dataN,
                                items: newItems,
                              } as DataNode;
                            }
                            return node;
                          });
                        });
                        setFieldsActivator((state) => ({
                          ...state,
                          [item.key]: "",
                        }));
                      }}
                      className="flex gap-1"
                    >
                      <Input
                        focusBorderColor="#f6bb0b"
                        borderColor={"#2d3b55"}
                        size={"xs"}
                        fontSize={10}
                        placeholder="Adicionar ativador"
                        onChange={({ target }) =>
                          setFieldsActivator((fields) => ({
                            ...fields,
                            [item.key]: target.value,
                          }))
                        }
                        value={fieldsActivator[item.key]}
                      />
                      <button className="nodrag min-h-full cursor-pointer bg-green-500 px-1 duration-200 hover:bg-green-400">
                        <MdOutlineAdd size={15} />
                      </button>
                    </form>
                  </div>
                </div>
                <CustomHandle
                  handleId={item.key}
                  nodeId={id}
                  type="source"
                  position={Position.Right}
                  style={{ right: -29, top: "50%" }}
                  isConnectable
                />
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    const itemId = nanoid();
                    const activator = String(
                      (node.data?.items?.length ?? 0) + 1
                    );

                    const newItems = dataN.items?.length
                      ? [
                          ...dataN.items,
                          {
                            key: itemId,
                            value: "",
                            activators: [{ value: activator, key: nanoid() }],
                          },
                        ]
                      : [
                          {
                            key: itemId,
                            value: "",
                            activators: [{ value: activator, key: nanoid() }],
                          },
                        ];

                    node.data = {
                      ...dataN,
                      items: newItems,
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
            className="flex items-center justify-between bg-green-800 p-2 duration-300 hover:bg-green-700 "
          >
            <span>Adicionar novo ativador</span>
            <IoMdAdd size={14} />
          </button>
        </div>
        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
