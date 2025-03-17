import { Button, Field, NumberInput } from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import TextareaAutosize from "react-textarea-autosize";
import { IoIosCloseCircle } from "react-icons/io";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useColorModeValue } from "@components/ui/color-mode";

type DataNode = {
  message: string;
  interval: number;
};

export const NodeIF: React.FC<Node<DataNode>> = () => {
  // const updateNode = useStore((s) => s.updateNode);

  const colorTrue = useColorModeValue("#00CE6B", "#179952");
  const colorFalse = useColorModeValue("#FB4F6A", "#FB4F6A");

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de resposta"
        description="Espera resposta do lead"
        node={{
          children: (
            <div className="p-[4.5px] translate-y-0.5 py-[9.5px] text-xs font-bold dark:text-yellow-300 text-yellow-600">
              {"if (..)"}
            </div>
          ),
          name: "Lógica",
          description: "Condição",
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

      <span className="absolute -right-[12.3px] top-[8.3px] dark:text-green-400 text-green-500">
        <FaCheck size={9.5} />
      </span>
      <Handle
        id={`${colorTrue} true`}
        type="source"
        position={Position.Right}
        style={{ right: -20, top: 13 }}
        className="dark:!border-green-400/60 dark:!bg-green-400/15 !border-green-500/80 !bg-green-500/15"
      />

      <span className="absolute -right-[13px] top-[31px] dark:text-red-400 text-red-500">
        <FaTimes size={11} />
      </span>
      <Handle
        id={`${colorFalse} false`}
        type="source"
        position={Position.Right}
        style={{ right: -20, top: 37 }}
        className="dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      />
    </div>
  );
};
