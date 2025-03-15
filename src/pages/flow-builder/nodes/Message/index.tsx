import { Field, Input, NumberInput, Text, Textarea } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { AiOutlineFieldTime } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow } from "@xyflow/react";
// import { CustomHandle } from "../../helpers/fn";
import { PatternNode } from "../Pattern";
import TextareaAutosize from "react-textarea-autosize";
import { TbSend } from "react-icons/tb";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverHeader,
} from "@components/ui/popover";

type DataNode = {
  message: string;
  interval: number;
};

export const NodeMessage: React.FC<Node<DataNode>> = ({ data }) => {
  const [open, setOpen] = useState(false);

  // const { setNodes } = useReactFlow();
  // const store = useStoreApi();

  // const data = useMemo(() => {
  //   const dataNode = store.getState().nodeInternals.get(id)?.data;
  //   return dataNode as DataNode;
  // }, [store.getState().nodeInternals.get(id)?.data]);

  return (
    <div>
      <PopoverRoot
        lazyMount
        unmountOnExit
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <PopoverTrigger>
          <PatternNode.PatternContainer
            open={open}
            nameNode="Texto"
            descriptionNode="Envia balões de texto"
            clickable
          >
            <div className="p-0.5">
              <TbSend
                className="dark:text-green-600 text-green-700"
                size={31}
              />
            </div>
          </PatternNode.PatternContainer>
        </PopoverTrigger>
        <PopoverContent w={"290px"} className="scroll-hidden overflow-y-scroll">
          <PopoverHeader
            position={"sticky"}
            top={0}
            paddingTop={"13px"}
            paddingBottom={"5px"}
            className="dark:!bg-[#111111] !bg-[#fff] z-10 border border-white/5 rounded-md rounded-b-none border-b-0"
          >
            <PopoverTitle className="font-bold text-base">
              Node de texto
            </PopoverTitle>
            <PopoverDescription className="dark:text-white/60 text-black/70">
              Envia vários balões de texto
            </PopoverDescription>
          </PopoverHeader>
          <PopoverBody>
            <div className="flex flex-col gap-y-5 ">
              <div className="gap-y-2 flex flex-col">
                <NumberInput.Root defaultValue="0" min={0} max={10} size={"md"}>
                  <div className="flex w-full justify-between px-2">
                    <div className="flex flex-col">
                      <NumberInput.Label fontWeight={"bolder"}>
                        Segundos digitando...
                      </NumberInput.Label>
                      <span className="text-white/70">Para enviar o balão</span>
                    </div>
                    <NumberInput.Input maxW={"50px"} />
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
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                  />
                </Field.Root>
              </div>
              <div className="gap-y-2 flex flex-col">
                <NumberInput.Root defaultValue="0" min={0} max={10} size={"md"}>
                  <div className="flex w-full justify-between px-2">
                    <div className="flex flex-col">
                      <NumberInput.Label fontWeight={"bolder"}>
                        Segundos digitando...
                      </NumberInput.Label>
                      <span className="text-white/70">Para enviar o balão</span>
                    </div>
                    <NumberInput.Input maxW={"50px"} />
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
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                  />
                </Field.Root>
              </div>
            </div>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};

{
  /* <div>
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
 <CustomHandle
  handleId={"main"}
  nodeId={id}
  type="source"
  position={Position.Right}
  style={{ right: -15 }}
/>

<PatternNode.Actions id={id} />
</div> */
}
