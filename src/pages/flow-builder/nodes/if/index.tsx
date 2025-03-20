import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useColorModeValue } from "@components/ui/color-mode";
import useStore from "../../flowStore";
import { ReactNode, useEffect, useState } from "react";
import { v4 } from "uuid";
import {
  createListCollection,
  Input,
  Select,
  Span,
  Stack,
} from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";

const entityList = createListCollection({
  items: [
    { label: "Entidade: Tem as tags", value: "has-tags" },
    { label: "Entidade: Não tem as tags", value: "no-tags" },
    { label: "Entidade: Variável", value: "var" },
  ],
});

const operatorComparisonList = createListCollection({
  items: [
    { label: "[...]", value: "[...]", description: "Contém" },
    { label: "===", value: "===", description: "Igual a" },
    { label: "!==", value: "!==", description: "Oposto de" },
    { label: "<", value: "<", description: "Menor que" },
    { label: "<=", value: "<=", description: "Menor/igual" },
    { label: ">", value: ">", description: "Maior que" },
    { label: ">=", value: ">=", description: "Maior/igual" },
    { label: "Regex", value: "regex", description: "/^(\\D)$/g" },
  ],
});

const operatorLogicList = createListCollection({
  items: [
    { label: "E", value: "&&", description: "&&" },
    { label: "OU", value: "||", description: "||" },
  ],
});

type DataNode = {
  list?: {
    key: string;
    type: "entity";
    name: "has-tags" | "no-tags" | "var";
    operatorComparison:
      | "==="
      | "!=="
      | ">="
      | "<="
      | ">"
      | "<"
      | "regex"
      | "[...]";
    operatorLogic: "&&" | "||";
    id: number;
  }[];
};

export const NodeIF: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);
  const [tags, setTags] = useState<Array<Tag>>([]);
  const [focus, setFocus] = useState(false);

  const colorTrue = useColorModeValue("#00CE6B", "#179952");
  const colorFalse = useColorModeValue("#FB4F6A", "#FB4F6A");

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
    if (!data.list?.length) {
      updateNode(id, { data: { list: [{ key: v4(), type: "entity" }] } });
    }
  }, [id]);

  return (
    <div>
      <PatternNode.PatternPopover
        size="300px"
        title="Node de condição IF"
        description="Verifica e executa regras lógicas"
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
        <div className="flex flex-col -mt-3 gap-y-4">
          {data.list?.map((item) => {
            const elements: ReactNode[] = [];
            elements.push(
              <div key={item.key} className="flex flex-col gap-y-2">
                <SelectRoot
                  // @ts-expect-error
                  value={data.id}
                  onValueChange={(e) => {
                    const nextList = data.list!.map((it) => {
                      // @ts-expect-error
                      if (it.key === item.key) it.name = e.value[0];
                      return it;
                    });
                    updateNode(id, { data: { list: nextList } });
                  }}
                  collection={entityList}
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Selecione a entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityList.items.map((time) => (
                      <SelectItem item={time} key={time.value}>
                        <Select.ItemText>{time.label}</Select.ItemText>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            );
            if (item.name === "has-tags" || item.name === "no-tags") {
              elements.push(
                <ReactTags
                  tags={tags}
                  suggestions={[]}
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
              );
            }
            if (item.name === "var") {
              elements.push(
                <div className="flex flex-col w-full mt-1.5">
                  <SelectRoot
                    // @ts-expect-error
                    value={data.id}
                    disabled={!item.name}
                    onValueChange={(e) => {
                      // const nextList = data.list!.map((it) => {
                      //   // @ts-expect-error
                      //   if (it.key === item.key) it.name = e.value[0];
                      //   return it;
                      // });
                      // updateNode(id, { data: { list: nextList } });
                    }}
                    collection={operatorComparisonList}
                    className="!gap-"
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Selecione a variável" />
                    </SelectTrigger>
                    <SelectContent className="scroll-hidden">
                      {operatorComparisonList.items.map((time) => (
                        <SelectItem item={time} key={time.value}>
                          <Stack gap="0">
                            <Select.ItemText textStyle={"md"}>
                              {time.label}
                            </Select.ItemText>
                            {time.description && (
                              <Span color="fg.muted" textStyle="xs">
                                {time.description}
                              </Span>
                            )}
                          </Stack>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  <div className="w-full flex">
                    <SelectRoot
                      // @ts-expect-error
                      value={data.id}
                      disabled={!item.name}
                      onValueChange={(e) => {
                        // const nextList = data.list!.map((it) => {
                        //   // @ts-expect-error
                        //   if (it.key === item.key) it.name = e.value[0];
                        //   return it;
                        // });
                        // updateNode(id, { data: { list: nextList } });
                      }}
                      collection={operatorComparisonList}
                      className="!gap-"
                      style={{ maxWidth: 90 }}
                    >
                      <SelectTrigger>
                        <SelectValueText
                          placeholder="Testar"
                          className="text-center -translate-x-0.5 w-full absolute"
                        />
                      </SelectTrigger>
                      <SelectContent className="scroll-hidden">
                        {operatorComparisonList.items.map((time) => (
                          <SelectItem item={time} key={time.value}>
                            <Stack gap="0">
                              <Select.ItemText textStyle={"md"}>
                                {time.label}
                              </Select.ItemText>
                              {time.description && (
                                <Span color="fg.muted" textStyle="xs">
                                  {time.description}
                                </Span>
                              )}
                            </Stack>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                    <Input placeholder="Valor" />
                  </div>
                </div>
              );
            }

            elements.push(
              <div className="w-full flex flex-col items-center mt-3">
                <SelectRoot
                  // @ts-expect-error
                  value={data.id}
                  disabled={!item.name}
                  onValueChange={(e) => {
                    // const nextList = data.list!.map((it) => {
                    //   // @ts-expect-error
                    //   if (it.key === item.key) it.name = e.value[0];
                    //   return it;
                    // });
                    updateNode(id, {
                      data: {
                        list: [...data.list!, { key: v4(), type: "entity" }],
                      },
                    });
                  }}
                  collection={operatorLogicList}
                  className="!gap-"
                  style={{ maxWidth: 100 }}
                >
                  <SelectTrigger>
                    <SelectValueText
                      placeholder="OP lógico"
                      className="text-center -translate-x-0.5 w-full absolute"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorLogicList.items.map((time) => (
                      <SelectItem item={time} key={time.value}>
                        <Stack direction={"row"} alignItems={"center"} gap="2">
                          <Select.ItemText textStyle={"md"}>
                            {time.label}
                          </Select.ItemText>
                          {time.description && (
                            <Span color="fg.muted" textStyle="xs">
                              {time.description}
                            </Span>
                          )}
                        </Stack>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
            );
            return <div>{elements}</div>;
          })}
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
