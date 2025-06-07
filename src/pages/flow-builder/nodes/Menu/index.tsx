import {
  Button,
  createListCollection,
  Input,
  NumberInput,
  Span,
  Stack,
} from "@chakra-ui/react";
import { JSX } from "react";
import { IoIosCloseCircle, IoMdAdd } from "react-icons/io";
import { Handle, useUpdateNodeInternals, Node, Position } from "@xyflow/react";
import { nanoid } from "nanoid";
import { PatternNode } from "../Pattern";
import { LiaListSolid } from "react-icons/lia";
import { useDBNodes, useVariables } from "../../../../db";
import useStore from "../../flowStore";
import { Field } from "@components/ui/field";
import { RxLapTimer } from "react-icons/rx";
import { IoReloadOutline } from "react-icons/io5";
import { useColorModeValue } from "@components/ui/color-mode";
import AutocompleteTextField from "@components/Autocomplete";
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";
import { CustomHandle } from "../../customs/node";

const timesList = createListCollection({
  items: [
    { label: "Seg", value: "seconds", description: "Segundos" },
    { label: "Min", value: "minutes", description: "Minutos" },
    { label: "Hor", value: "hours", description: "Horas" },
    { label: "Dia", value: "days", description: "Dias" },
  ],
});

type DataNode = {
  interval?: number;
  header?: string;
  items: { value: string; key: string }[];
  footer?: string;
  validateReply?: {
    attempts: number;
    messageErrorAttempts?: { interval?: number; value?: string };
  };
  timeout?: {
    type: ("seconds" | "minutes" | "hours" | "days")[];
    value: number;
  };
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const updateNodeInternals = useUpdateNodeInternals();
  const nodes = useDBNodes();
  const variables = useVariables();
  const { updateNode, delEdge } = useStore((s) => ({
    updateNode: s.updateNode,
    delEdge: s.delEdge,
  }));
  const node = nodes.find((s) => s.id === id) as
    | (Node<DataNode> & { preview?: string[] })
    | undefined;

  const getNodePreview = useStore((s) => s.getNodePreview);
  const preview = getNodePreview(id);

  if (!node) return <span>Não encontrado</span>;

  return (
    <div className="flex flex-col -mt-3 mb-5">
      <NumberInput.Root
        min={0}
        max={60}
        size={"md"}
        defaultValue={node.data.interval ? String(node.data.interval) : "0"}
        onBlur={(e) => {
          updateNode(id, {
            // @ts-expect-error
            data: { ...node.data, interval: Number(e.target.value) },
          });
        }}
      >
        <div className="flex w-full justify-between px-2">
          <div className="flex flex-col">
            <NumberInput.Label fontWeight={"medium"}>
              Segundos digitando...
            </NumberInput.Label>
            <span className="dark:text-white/70 text-black/50 font-light">
              Pra enviar o menu de opções
            </span>
          </div>
          <NumberInput.Input maxW={"43px"} />
        </div>
      </NumberInput.Root>
      <div className="flex flex-col">
        <div className="flex flex-col gap-y-1 py-3">
          <Field label="Título">
            <Input
              onBlur={(e) => {
                updateNode(id, {
                  data: { ...node.data, header: e.target.value },
                });
              }}
              autoComplete="off"
              size={"xs"}
              defaultValue={node.data.header ? String(node.data.header) : ""}
            />
          </Field>
          <div className="my-1 flex flex-col gap-1">
            <span className="text-white/70 text-center">
              Menu de opções {node.data?.items?.length}/8
            </span>
            <ul className="space-y-3 mb-3">
              {node.data?.items?.map((item, index) => (
                <li
                  key={item.key}
                  className="relative flex w-full items-center pl-2 gap-1.5 min-w-full"
                >
                  <a
                    className="absolute -top-2 -left-2"
                    onClick={() => {
                      delEdge(item.key);
                      const nextItems = node.data.items.filter(
                        (i) => i.key !== item.key
                      );
                      const nextPreview = preview?.filter(
                        (key: string) => key !== item.key
                      );
                      updateNode(id, {
                        preview: nextPreview,
                        data: { ...node.data, items: nextItems },
                      });
                      updateNodeInternals(id);
                    }}
                  >
                    <IoIosCloseCircle
                      size={20}
                      className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
                    />
                  </a>
                  <span className="font-semibold tracking-wide">
                    {`[${index + 1}]`}
                  </span>
                  <Field>
                    <Input
                      onBlur={(e) => {
                        node.data.items[index].value = e.target.value;
                        updateNode(id, {
                          data: { ...node.data, items: node.data.items },
                        });
                      }}
                      bg={"#181818d6"}
                      autoComplete="off"
                      size={"xs"}
                      placeholder="Digite o nome da opção"
                      defaultValue={
                        node.data.items[index].value
                          ? String(node.data.items[index].value)
                          : ""
                      }
                    />
                  </Field>
                </li>
              ))}
            </ul>
            {node.data?.items?.length < 8 && (
              <Button
                onClick={() => {
                  const itemId = nanoid();

                  const items = node.data?.items?.length
                    ? [...node.data.items, { key: itemId, value: "" }]
                    : [{ key: itemId, value: "" }];

                  const pp = preview?.length ? [...preview, itemId] : [itemId];
                  updateNode(id, {
                    preview: pp,
                    data: { ...node.data, items },
                  });
                  updateNodeInternals(id);
                }}
                variant={"plain"}
                colorPalette={"green"}
                size={"xs"}
              >
                <span>Adicionar nova opção</span>
                <IoMdAdd size={14} />
              </Button>
            )}
          </div>
          <Field label="Rodapé">
            <Input
              onBlur={(e) => {
                updateNode(id, {
                  data: { ...node.data, footer: e.target.value },
                });
              }}
              autoComplete="off"
              size={"xs"}
              defaultValue={node.data.footer ? String(node.data.footer) : ""}
            />
          </Field>
        </div>
        <div className="space-y-3.5 border-t border-white/10 pt-3">
          <div className="flex flex-col gap-y-2">
            <span className="font-medium text-center">
              Mensagem de resposta inválida
            </span>
            <div className="flex flex-col gap-y-2">
              <NumberInput.Root
                min={0}
                max={60}
                size={"md"}
                defaultValue={
                  node.data.interval ? String(node.data.interval) : "0"
                }
                onBlur={(e) => {
                  updateNode(id, {
                    // @ts-expect-error
                    data: { ...node.data, interval: Number(e.target.value) },
                  });
                }}
              >
                <div className="flex w-full gap-x-1 justify-between px-2">
                  <div className="flex flex-col w-full">
                    <NumberInput.Label fontWeight={"medium"}>
                      Segundos digitando...
                    </NumberInput.Label>
                    <span className="dark:text-white/70 text-black/50 font-light">
                      Pra enviar mensagem de erro
                    </span>
                  </div>
                  <NumberInput.Input maxW={"43px"} />
                </div>
              </NumberInput.Root>
              <AutocompleteTextField
                // @ts-expect-error
                trigger={["{{"]}
                type="textarea"
                options={{ "{{": variables.map((s) => s.name) }}
                spacer={"}} "}
                placeholder="Digite sua {{mensagem}} aqui"
                defaultValue={
                  node.data.validateReply?.messageErrorAttempts?.value || ""
                }
                // @ts-expect-error
                onBlur={({ target }) => {
                  updateNode(id, {
                    data: {
                      ...node.data,
                      validateReply: {
                        ...node.data.validateReply,
                        messageErrorAttempts: {
                          ...node.data.validateReply?.messageErrorAttempts,
                          value: target.value,
                        },
                      },
                    },
                  });
                }}
              />
            </div>
          </div>
          <div className="border-t border-white/10"></div>
          <NumberInput.Root
            min={0}
            max={60}
            size={"md"}
            defaultValue={node.data.interval ? String(node.data.interval) : "0"}
            onBlur={(e) => {
              updateNode(id, {
                // @ts-expect-error
                data: { ...node.data, interval: Number(e.target.value) },
              });
            }}
          >
            <div className="flex w-full gap-x-1 justify-between px-2">
              <div className="flex flex-col w-full">
                <NumberInput.Label fontWeight={"medium"}>
                  Quantidade de tentativas
                </NumberInput.Label>
                <span className="dark:text-white/70 flex items-center gap-x-1.5 tracking-tight text-black/50 font-light">
                  Para sair no próximo passo{" "}
                  <IoReloadOutline size={14} className="text-orange-400" />
                </span>
              </div>
              <NumberInput.Input maxW={"43px"} />
            </div>
          </NumberInput.Root>

          <div className="grid grid-cols-[1fr_43px_75px] gap-x-1 px-2 w-full justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Tempo máximo</span>
              <span className="dark:text-white/70 flex items-center gap-x-1.5 tracking-tight text-black/50 font-light">
                Para sair no
                <RxLapTimer size={15} className="text-red-400" />
              </span>
            </div>
            <NumberInput.Root
              min={0}
              max={60}
              size={"md"}
              value={
                node.data.timeout?.value ? String(node.data.timeout.value) : "0"
              }
              defaultValue="0"
            >
              <NumberInput.Input
                style={{
                  borderColor: node.data.timeout?.value ? "transparent" : "",
                }}
                maxW={"43px"}
                onBlur={({ target }) => {
                  updateNode(id, {
                    data: {
                      ...node.data,
                      timeout: {
                        ...node.data.timeout,
                        value: Number(target.value),
                      },
                    },
                  });
                }}
              />
            </NumberInput.Root>
            <SelectRoot
              value={node.data.timeout?.type}
              onValueChange={(e) => {
                updateNode(id, {
                  data: {
                    ...node.data,
                    timeout: { ...node.data.timeout, type: e.value },
                  },
                });
              }}
              collection={timesList}
            >
              <SelectTrigger>
                <SelectValueText placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {timesList.items.map((time) => (
                  <SelectItem item={time} key={time.value}>
                    <Stack gap="0">
                      <SelectItemText>{time.label}</SelectItemText>
                      <Span color="fg.muted" textStyle="xs">
                        {time.description}
                      </Span>
                    </Stack>
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        </div>
      </div>
    </div>
  );
}

export const NodeMenu: React.FC<Node<DataNode>> = ({ id }) => {
  const getNodePreview = useStore((s) => s.getNodePreview);
  const preview = getNodePreview(id);
  const colorTimeout = useColorModeValue("#F94A65", "#B1474A");
  const colorFailed = useColorModeValue("#ee9e42", "#a55d29");

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node menu"
        description="Envie um menu de opções"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        node={{
          children: (
            <div
              style={{
                height:
                  preview?.length >= 2 ? 14 * preview?.length + 50 - 35 : 35,
              }}
              className="p-0.5 relative flex items-center"
            >
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LiaListSolid
                className="dark:text-purple-400 text-purple-700"
                size={31}
              />
            </div>
          ),
          name: "Menu",
          description: "Envia",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      {preview?.map((id: any, index: number) => (
        <Handle
          id={id}
          key={id}
          type="source"
          position={Position.Right}
          style={{ right: -20, top: 14 * index + 6 }}
          className="relative"
        >
          <span
            style={{ fontSize: 9, top: -3, left: -13.8 }}
            className="absolute cursor-default text-white/50 -left-[13px] font-medium"
          >
            {`[${index + 1}]`}
          </span>
        </Handle>
      ))}

      <CustomHandle
        nodeId={id}
        handleId={`${colorFailed} failed`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: 10, top: "initial" }}
        isConnectable={true}
        className="relative dark:text-orange-400 text-orange-500 dark:!border-orange-400/60 dark:!bg-orange-400/15 !border-orange-500/70 !bg-orange-500/15"
        title="Tentativa de resposta"
      >
        <IoReloadOutline
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>

      <CustomHandle
        nodeId={id}
        handleId={`${colorTimeout} timeout`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: -3, top: "initial" }}
        isConnectable={true}
        title="Tempo esgotado"
        className="relative dark:text-red-400 text-red-500 dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      >
        <RxLapTimer
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
    </div>
  );
};
