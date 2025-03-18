import { Button, Field, NumberInput } from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import TextareaAutosize from "react-textarea-autosize";
import { TbTextSize } from "react-icons/tb";
import { IoIosCloseCircle } from "react-icons/io";
import { useEffect, useRef } from "react";
import useStore from "../../flowStore";
import { v4 } from "uuid";

type DataNode = {
  messages?: {
    text: string;
    interval?: number;
    key: string;
  }[];
};

export const NodeMessage: React.FC<Node<DataNode>> = ({
  data,
  id,
  width,
  height,
  ...node
}) => {
  const updateNode = useStore((s) => s.updateNode);

  useEffect(() => {
    if (!data.messages?.length) {
      updateNode(id, {
        data: { messages: [{ key: v4(), text: "" }] },
      });
    }
  }, []);

  const refTextarea = useRef(null);

  useEffect(() => {
    console.log(refTextarea);
  }, [refTextarea]);

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de texto"
        description="Envia vários balões de texto"
        node={{
          children: (
            <div className="p-0.5">
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
        <div className="flex flex-col gap-y-5">
          {!!data.messages?.length &&
            data.messages!.map((msg) => (
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
                          messages: data.messages!.filter(
                            (s) => s.key !== msg.key
                          ),
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
                  value={msg.interval ? String(msg.interval) : "0"}
                  defaultValue="0"
                  onValueChange={(e) => {
                    const nextMessages = data.messages!.map((m) => {
                      if (m.key === msg.key) {
                        m.interval = e.valueAsNumber;
                      }
                      return m;
                    });
                    updateNode(id, {
                      data: { messages: nextMessages },
                    });
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
                    <NumberInput.Input
                      style={{
                        borderColor: msg.interval ? "transparent" : "",
                      }}
                      maxW={"43px"}
                    />
                  </div>
                </NumberInput.Root>

                <Field.Root gap={"3px"} required>
                  <TextareaAutosize
                    ref={refTextarea}
                    placeholder="Digite sua mensagem aqui"
                    style={{
                      resize: "none",
                      borderColor: msg.text ? "transparent" : "",
                    }}
                    minRows={1}
                    maxRows={10}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    onChange={({ target }) => {
                      const nextMessages = data.messages!.map((m) => {
                        if (m.key === msg.key) m.text = target.value;
                        return m;
                      });
                      updateNode(id, {
                        data: { messages: nextMessages },
                      });
                    }}
                    onBlur={() => {
                      const nextMessages = data.messages!.map((m) => {
                        if (m.key === msg.key) m.text = m.text.trim();
                        return m;
                      });
                      updateNode(id, {
                        data: { messages: nextMessages },
                      });
                    }}
                    value={msg.text}
                  />
                </Field.Root>
              </div>
            ))}

          <Button
            onClick={() => {
              updateNode(id, {
                ...node,
                data: {
                  messages: [...data.messages!, { key: v4(), text: "" }],
                },
              });
            }}
            size={"sm"}
            colorPalette={"green"}
          >
            Adicionar balão
          </Button>
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
