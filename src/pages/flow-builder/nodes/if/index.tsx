import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useColorModeValue } from "@components/ui/color-mode";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { createListCollection, Select, Span, Stack } from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import AutocompleteTextField from "@components/Autocomplete";
import SelectTags from "@components/SelectTags";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type NameEntity = "has-tags" | "no-tags" | "var";

const operatorComparisonList = createListCollection({
  items: [
    { label: "[...]", value: "[...]", description: "Contém" },
    { label: "===", value: "===", description: "Igual a" },
    { label: "!==", value: "!==", description: "Oposto de" },
    { label: "<", value: "<", description: "Menor que" },
    { label: "<=", value: "<=", description: "Menor/igual" },
    { label: ">", value: ">", description: "Maior que" },
    { label: ">=", value: ">=", description: "Maior/igual" },
    // { label: "Regex", value: "regex", description: "/^(\\D)$/g" },
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
    name: NameEntity;
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
    tagIds: number[];
    value1: string;
    value2: string;
    flags?: string[];
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
    <div className="flex flex-col -mt-3 gap-y-4 min-h-60">
      {data.list?.map((item, index) => {
        let isDisabled = false;
        if (item.name === "var") {
          isDisabled = !item.value1 || !item.value2 || !item.operatorComparison;
        } else if (item.name === "has-tags" || item.name === "no-tags") {
          isDisabled = !item.tagIds.length;
        }

        return (
          <div key={item.key} className="flex flex-col flex-1">
            <div className="flex flex-col flex-1 gap-y-2 h-full">
              <TabsRoot
                lazyMount
                unmountOnExit
                variant={"enclosed"}
                value={item.name}
                onValueChange={(e) => {
                  data.list![index].name = e.value as NameEntity;
                  updateNode(id, { data: { list: data.list } });
                }}
                className="h-full flex-1"
              >
                <TabsList minW={"100%"} bg="#1c1c1c" rounded="l3" p="1.5">
                  <TabsTrigger
                    _selected={{ bg: "bg.subtle", color: "#fff" }}
                    color={"#757575"}
                    value="has-tags"
                    w={"100%"}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs leading-3">Tem as</span>
                      <span className="leading-4">Etiquetas</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    _selected={{ bg: "bg.subtle", color: "#fff" }}
                    color={"#757575"}
                    value="no-tags"
                    w={"100%"}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs leading-3">Não tem as</span>
                      <span className="leading-4">Etiquetas</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    _selected={{ bg: "bg.subtle", color: "#fff" }}
                    color={"#757575"}
                    value="var"
                    w={"100%"}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs leading-3">Lógica de</span>
                      <span className="leading-4">Variável</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="has-tags">
                  <div className="-mt-2">
                    <SelectTags
                      isMulti={true}
                      isClearable
                      isFlow
                      menuPlacement="bottom"
                      value={data.list![index].tagIds}
                      onChange={(e: any) => {
                        data.list![index].tagIds = e.map(
                          (item: any) => item.value
                        );
                        updateNode(id, {
                          data: { list: data.list },
                        });
                      }}
                      onCreate={(tag) => {
                        data.list![index].tagIds.push(tag.id);
                        updateNode(id, { data: { list: data.list } });
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="no-tags">
                  <div className="-mt-2">
                    <SelectTags
                      isMulti={true}
                      isClearable
                      isFlow
                      menuPlacement="bottom"
                      value={data.list![index].tagIds}
                      onChange={(e: any) => {
                        data.list![index].tagIds = e.map(
                          (item: any) => item.value
                        );
                        updateNode(id, {
                          data: { list: data.list },
                        });
                      }}
                      onCreate={(tag) => {
                        data.list![index].tagIds.push(tag.id);
                        updateNode(id, { data: { list: data.list } });
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="var">
                  <div className="flex flex-col w-full -mt-2">
                    <AutocompleteTextField
                      // @ts-expect-error
                      trigger={["{{"]}
                      options={{ "{{": variables?.map((s) => s.name) || [] }}
                      spacer={"}}"}
                      placeholder="Definir valor 1 ou {{variável_1}}"
                      defaultValue={item.value1 || ""}
                      onChange={(target: string) => {
                        data.list![index].value1 = target;
                        setDataMok({ list: data.list });
                      }}
                    />

                    <div className="w-full flex gap-1 mt-1">
                      <SelectRoot
                        value={[item.operatorComparison || ""]}
                        disabled={!item.name}
                        onValueChange={(e) => {
                          data.list![index].operatorComparison = e
                            .value[0] as any;
                          updateNode(id, { data: { list: data.list } });
                        }}
                        collection={operatorComparisonList}
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
                      {item.operatorComparison !== "regex" && (
                        <AutocompleteTextField
                          // @ts-expect-error
                          trigger={["{{"]}
                          options={{
                            "{{": variables?.map((s) => s.name) || [],
                          }}
                          spacer={"}}"}
                          placeholder="Definir valor 2 ou {{variável_2}}"
                          defaultValue={item.value2 || ""}
                          onChange={(target: string) => {
                            data.list![index].value2 = target;
                            setDataMok({ list: data.list });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </TabsRoot>
            </div>
            <div className="w-full flex flex-col items-center mt-3">
              <SelectRoot
                value={[item.operatorLogic || ""]}
                disabled={isDisabled}
                onValueChange={(e) => {
                  data.list![index].operatorLogic = e.value[0] as any;
                  updateNode(id, {
                    data: { list: [...data.list!, { key: nanoid() }] },
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
          </div>
        );
      })}
    </div>
  );
}

export const NodeIF: React.FC<Node<DataNode>> = ({ id, data }) => {
  const colorTrue = useColorModeValue("#00CE6B", "#179952");
  const colorFalse = useColorModeValue("#FB4F6A", "#FB4F6A");

  return (
    <div>
      <PatternNode.PatternPopover
        size="350px"
        title="Node de condição IF"
        description="Verifica e executa regras lógicas"
        node={{
          children: (
            <div className="relative p-[4.5px] translate-y-0.5 py-[9.5px] text-xs font-bold dark:text-yellow-300 text-yellow-600">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              {"if (..)"}
            </div>
          ),
          name: "Lógica",
          description: "Condição",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      <span className="absolute -right-[12.3px] top-[8.3px] dark:text-green-400 text-green-500">
        <FaCheck size={9.5} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`${colorTrue} true`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 13 }}
        isConnectable={true}
        className="dark:!border-green-400/60 dark:!bg-green-400/15 !border-green-500/80 !bg-green-500/15"
      />

      <span className="absolute -right-[13px] top-[31px] dark:text-red-400 text-red-500">
        <FaTimes size={11} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`${colorFalse} false`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 37 }}
        isConnectable={true}
        className="dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      />
    </div>
  );
};
