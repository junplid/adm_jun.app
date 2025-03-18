import {
  Button,
  createListCollection,
  NumberInput,
  Select,
  Span,
  Stack,
} from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { BsChatLeftDots } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";
import { useColorModeValue } from "@components/ui/color-mode";

import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import { useEffect, useState } from "react";
import useStore from "../../flowStore";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";

const suggestions = ["Teste 1", "Teste 2"].map((country) => {
  return {
    id: country,
    text: country,
    className: "",
  };
});

type DataNode = {
  isSave?: boolean;
  variables?: { id?: number; name?: number }[];
  timeout?: {
    type: "sec" | "min" | "hor";
    value: number;
  };
};

const timesList = createListCollection({
  items: [
    {
      label: "Seg",
      value: "seg",
      description: "Segundos",
    },
    {
      label: "Min",
      value: "min",
      description: "Minutos",
    },
    {
      label: "Hor",
      value: "hor",
      description: "Horas",
    },
  ],
});

export const NodeReply: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);
  const colorTimeout = useColorModeValue("#F94A65", "#B1474A");

  const [tags, setTags] = useState<Array<Tag>>([]);
  const [focus, setFocus] = useState(false);

  const handleDelete = (index: number) => {
    if (!index && tags.length === 1) {
      setTags(tags.filter((_, i) => i !== index));
    } else {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const handleAddition = (tag: Tag) => {
    setTags((prevTags) => {
      return [
        ...prevTags,
        { ...tag, text: tag.text.trim().replace(/\s/g, "_") },
      ];
    });
  };

  useEffect(() => {
    if (!data.timeout) {
      updateNode(id, { data: { timeout: { value: 5 } } });
    }
  }, []);

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de resposta"
        description="Salve a resposta em várias variáveis"
        node={{
          children: (
            <div className="p-1">
              <BsChatLeftDots
                className="dark:text-blue-400 text-blue-700"
                size={26.8}
              />
            </div>
          ),
          name: "Resposta",
          description: "Receber",
        }}
      >
        <div className="flex flex-col -mt-3 gap-y-5">
          {!!data.isSave && (
            <ReactTags
              tags={tags}
              suggestions={suggestions}
              separators={[SEPARATORS.ENTER]}
              handleAddition={handleAddition}
              handleDelete={handleDelete}
              placeholder="Digite e pressione `ENTER`"
              allowDragDrop={false}
              handleInputFocus={() => setFocus(true)}
              handleInputBlur={() => setFocus(false)}
              handleTagClick={handleDelete}
              classNames={{
                selected: `flex flex-wrap border p-2 rounded-sm gap-1.5 gap-y-2 w-full ${focus ? "border-white" : "border-white/10"}`,
                tagInputField:
                  "!border-none bg-[#ffffff05] focus:bg-[#ffffff10] outline-none p-1 px-2 w-full",
                remove: "hidden",
                tag: "hover:bg-red-500 duration-300 !cursor-pointer bg-white/15 px-1",
                tagInput: "w-full",
              }}
            />
          )}

          <Button
            onClick={() =>
              updateNode(id, { data: { ...data, isSave: !data.isSave } })
            }
            size={"sm"}
            colorPalette={data.isSave ? "red" : "green"}
          >
            {data.isSave ? "Não salvar " : "Salvar "}a resposta
          </Button>

          <div className="grid grid-cols-[1fr_43px_75px] gap-x-1 w-full justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Tempo esperando</span>
              <span className="dark:text-white/70 text-black/50 font-light">
                Resposta do lead
              </span>
            </div>
            <NumberInput.Root
              min={0}
              max={60}
              size={"md"}
              value={data.timeout?.value ? String(data.timeout.value) : "0"}
              defaultValue="0"
              onValueChange={(e) => {
                updateNode(id, {
                  data: {
                    ...data,
                    timeout: { ...data.timeout, value: e.valueAsNumber },
                  },
                });
              }}
            >
              <NumberInput.Input
                style={{
                  borderColor: data.timeout?.value ? "transparent" : "",
                }}
                maxW={"43px"}
              />
            </NumberInput.Root>
            <SelectRoot
              // @ts-expect-error
              value={data.timeout?.type}
              defaultValue={["min"]}
              onValueChange={(e) => {
                updateNode(id, {
                  data: {
                    ...data,
                    timeout: { ...data.timeout, type: e.value },
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
                      <Select.ItemText>{time.label}</Select.ItemText>
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
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      <Handle
        type="source"
        position={Position.Right}
        style={{ right: -8, top: 12 }}
      />
      <span className="absolute -right-[13px] top-[31px] dark:text-red-400 text-red-500">
        <RxLapTimer size={11} />
      </span>
      <Handle
        id={`${colorTimeout} timeout`}
        type="source"
        position={Position.Right}
        style={{ right: -20, top: 37 }}
        className="dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      />
    </div>
  );
};
