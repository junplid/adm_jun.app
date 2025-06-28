import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useState } from "react";
import { Button, Input, InputGroup, Menu, Portal } from "@chakra-ui/react";
import { useDBNodes, useVariables } from "../../../../db";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { BsRegex } from "react-icons/bs";
import { FaFontAwesomeFlag } from "react-icons/fa";

type DataNode = {
  var1Id: number;
  regex: string;
  flags: string[];
  value: string;
  var2Id: number;
};

const items = [
  { title: "Global", value: "g" },
  { title: "Case insensitive", value: "i" },
  { title: "Multiline", value: "m" },
  { title: "Single line", value: "s" },
  { title: "Unicode", value: "u" },
  { title: "Sticky", value: "y" },
];

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;
  const updateNode = useStore((s) => s.updateNode);
  const variables = useVariables();
  const [isOpen, setIsOpen] = useState(false);

  if (!node) {
    return <span>Não encontrado</span>;
  }

  return (
    <div className="flex flex-col -mt-3 gap-y-2 min-h-60">
      <Field label="Variável de origem">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={node.data.var1Id}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...node.data, var1Id: e.value },
            });
          }}
        />
      </Field>

      <div className="flex items-center gap-1">
        <InputGroup
          startAddon="/"
          endAddon={`/${node.data.flags?.join("") || ""}`}
        >
          <Input
            placeholder="CODE=(\d+).*"
            defaultValue={node.data.regex || ""}
            size={"xs"}
            fontSize={14}
            onBlur={({ target }) => {
              updateNode(id, { data: { ...node.data, regex: target.value } });
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
                      checked={node.data.flags.includes(value)}
                      onCheckedChange={(e) => {
                        if (e) {
                          updateNode(id, {
                            data: {
                              ...node.data,
                              flags: [...node.data.flags, value],
                            },
                          });
                        } else {
                          updateNode(id, {
                            data: {
                              ...node.data,
                              flags: node.data.flags.filter((f) => f !== value),
                            },
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
      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables.map((s) => s.name) }}
        spacer={"}}"}
        placeholder="Exemplo: $1"
        defaultValue={node.data.value || ""}
        // @ts-expect-error
        onBlur={({ target }) => {
          updateNode(id, { data: { ...node.data, value: target.value } });
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
          value={node.data.var2Id}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...node.data, var2Id: e.value },
            });
          }}
          onCreate={(d) => {
            updateNode(id, { data: { ...node.data, var2Id: d.id } });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeExtractVariable: React.FC<Node<DataNode>> = ({ id }) => {
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
        <BodyNode id={id} />
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
