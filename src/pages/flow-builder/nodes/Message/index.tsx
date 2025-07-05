import { Button, NumberInput } from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { IoIosCloseCircle } from "react-icons/io";
import { TbTextSize } from "react-icons/tb";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  messages: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);
  const { data: variables } = useGetVariablesOptions();

  const [dataMok, setDataMok] = useState(data as DataNode);
  const [init, setInit] = useState(false);
  useEffect(() => {
    if (!init) {
      setInit(true);
      return;
    }
    return () => {
      setInit(false);
    };
  }, [init]);

  useEffect(() => {
    if (!init) return;
    const debounce = setTimeout(() => updateNode(id, { data: dataMok }), 200);
    return () => {
      clearTimeout(debounce);
    };
  }, [dataMok]);

  return (
    <div className="flex flex-col gap-y-5 -mt-3">
      {!!data.messages?.length &&
        data.messages!.map((msg, index) => (
          <div
            key={msg.key}
            className="relative group gap-y-2 flex flex-col dark:bg-zinc-600/10 py-2.5 rounded-sm p-2"
          >
            {data.messages!.length > 1 && (
              <a
                className="absolute -top-2 -left-2"
                onClick={() => {
                  updateNode(id, {
                    data: {
                      messages: data.messages!.filter((s) => s.key !== msg.key),
                    },
                  });
                }}
              >
                <IoIosCloseCircle
                  size={22}
                  className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
                />
              </a>
            )}
            <NumberInput.Root
              min={0}
              max={60}
              size={"md"}
              defaultValue={msg.interval ? String(msg.interval) : "0"}
              onChange={(e) => {
                // @ts-expect-error
                data.messages[index].interval = e.target.value;
                setDataMok({ messages: data.messages });
              }}
            >
              <div className="flex w-full justify-between px-2">
                <div className="flex flex-col">
                  <NumberInput.Label fontWeight={"medium"}>
                    Segundos digitando...
                  </NumberInput.Label>
                  <span className="dark:text-white/70 text-black/50 font-light">
                    Para enviar o prox balão
                  </span>
                </div>
                <NumberInput.Input maxW={"43px"} />
              </div>
            </NumberInput.Root>

            <AutocompleteTextField
              // @ts-expect-error
              trigger={["{{"]}
              options={{ "{{": variables?.map((s) => s.name) || [] }}
              spacer={"}} "}
              type="textarea"
              placeholder="Digite sua mensagem aqui"
              defaultValue={msg.text}
              // @ts-expect-error
              onChange={(value) => {
                data.messages[index].text = value;
                setDataMok({ messages: data.messages });
              }}
            />
          </div>
        ))}

      <Button
        onClick={() => {
          updateNode(id, {
            data: {
              messages: [...(data.messages || []), { key: nanoid(), text: "" }],
            },
          });
        }}
        size={"sm"}
        colorPalette={"green"}
      >
        Adicionar balão
      </Button>
    </div>
  );
}

export const NodeMessage: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de texto"
        description="Envia vários balões de texto"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <TbTextSize
                className="dark:text-teal-400 text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Texto",
          description: "Envia",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <CustomHandle
        nodeId={id}
        handleId="main"
        position={Position.Right}
        type="source"
        style={{ right: -8 }}
        isConnectable={true}
      />
    </div>
  );
};
