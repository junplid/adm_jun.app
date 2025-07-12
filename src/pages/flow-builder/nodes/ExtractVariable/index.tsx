import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import { Button, Input, InputGroup, Menu, Portal } from "@chakra-ui/react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { BsRegex } from "react-icons/bs";
import { FaFontAwesomeFlag } from "react-icons/fa";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import SelectComponent from "@components/Select";

type DataNode = {
  var1Id: number;
  regex: string;
  flags: string[];
  value: string;
  var2Id: number;
  tools?: "match" | "replace";
};

const items = [
  { title: "Global", value: "g" },
  { title: "Case insensitive", value: "i" },
  { title: "Multiline", value: "m" },
  { title: "Single line", value: "s" },
  { title: "Unicode", value: "u" },
  { title: "Sticky", value: "y" },
];

const optionsTools = [
  { label: "Pick (match)", value: "match" },
  { label: "Substituir (replace)", value: "replace" },
];

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode } = useStore((s) => ({
    updateNode: s.updateNode,
  }));
  const { data: variables } = useGetVariablesOptions();
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="flex flex-col -mt-3 gap-y-2 min-h-60">
      <Field label="Variável de origem">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.var1Id}
          onChange={(e: any) => setDataMok({ ...data, var1Id: e.value })}
        />
      </Field>

      <div className="flex items-center gap-1">
        <InputGroup startAddon="/" endAddon={`/${data.flags?.join("") || ""}`}>
          <Input
            placeholder="CODE=(\d+).*"
            defaultValue={data.regex || ""}
            size={"xs"}
            fontSize={14}
            onChange={({ target }) => {
              setDataMok({ ...data, regex: target.value });
            }}
          />
        </InputGroup>

        <Menu.Root
          closeOnSelect={false}
          onOpenChange={(s) => setIsOpen(s.open)}
          open={isOpen}
        >
          <Menu.Trigger asChild>
            <Button variant="outline" size="xs">
              <FaFontAwesomeFlag />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {items.map(({ title, value }) => {
                  return (
                    <Menu.CheckboxItem
                      key={value}
                      value={value}
                      checked={data.flags.includes(value)}
                      onCheckedChange={(e) => {
                        if (e) {
                          setDataMok({
                            ...data,
                            flags: [...data.flags, value],
                          });
                        } else {
                          setDataMok({
                            ...data,
                            flags: data.flags.filter((f) => f !== value),
                          });
                        }
                      }}
                    >
                      <strong>{value}</strong>
                      {""}
                      <span className="text-white/50 text-[13px]">{title}</span>
                      <Menu.ItemIndicator />
                    </Menu.CheckboxItem>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </div>
      <Field label="Selecione a ferramenta" className="mt-3">
        <SelectComponent
          isMulti={false}
          menuPlacement="bottom"
          isFlow
          placeholder={"Pick (match)"}
          isClearable={false}
          value={
            data.tools
              ? {
                  label:
                    optionsTools.find((s) => s.value === data.tools)?.label ||
                    "",
                  value: data.tools,
                }
              : null
          }
          options={optionsTools}
          onChange={(e: any) =>
            updateNode(id, { data: { ...data, tools: e.value } })
          }
        />
      </Field>

      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables?.map((s) => s.name) || [] }}
        spacer={"}}"}
        placeholder={data.tools === "match" ? "Exemplo: $[1]" : "Exemplo: $1"}
        defaultValue={data.value || ""}
        onChange={(target: string) => {
          setDataMok({ ...data, value: target });
        }}
      />
      <Field label="Variável de destino">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          filter={(s) => s.filter((v) => v.type === "dynamics")}
          isFlow
          value={data.var2Id}
          onChange={(e: any) => setDataMok({ ...data, var2Id: e.value })}
          onCreate={(d) => setDataMok({ ...data, var2Id: d.id })}
        />
      </Field>
    </div>
  );
}

export const NodeExtractVariable: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        size="290px"
        title="Extrair da variável"
        description="Extrai texto de uma variável para outra"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <BsRegex className="dark:text-white/70" size={27} />
            </div>
          ),
          name: "Variável",
          description: "Extrair da",
        }}
      >
        <BodyNode id={id} data={data} />
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
