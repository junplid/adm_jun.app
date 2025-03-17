import { Button, Field, NumberInput } from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import TextareaAutosize from "react-textarea-autosize";
import { TbTextSize } from "react-icons/tb";
import { IoIosCloseCircle } from "react-icons/io";
// import useStore from "../../flowStore";

type DataNode = {
  message: string;
  interval: number;
};

export const NodeMessage: React.FC<Node<DataNode>> = () => {
  // const updateNode = useStore((s) => s.updateNode);

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
          {/* Item do balão */}
          <div className="relative group gap-y-2 flex flex-col dark:bg-zinc-600/10 py-2.5 rounded-sm p-2">
            <a className="absolute -top-2 -left-2">
              <IoIosCloseCircle
                size={22}
                className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
              />
            </a>
            <NumberInput.Root defaultValue="0" min={0} max={60} size={"md"}>
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

            <Field.Root gap={"3px"} required>
              <Field.Label>
                Balão de texto <Field.RequiredIndicator />
              </Field.Label>
              <TextareaAutosize
                placeholder="Digite sua mensagem aqui"
                style={{ resize: "none" }}
                minRows={3}
                maxRows={10}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
              />
            </Field.Root>
          </div>

          <Button size={"sm"} colorPalette={"green"}>
            Adicionar balão
          </Button>
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
