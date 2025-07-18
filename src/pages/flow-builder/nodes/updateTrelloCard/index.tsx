import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import AutocompleteTextField from "@components/Autocomplete";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import SelectTrelloIntegrations from "@components/SelectTrelloIntegrations";
import { Input } from "@chakra-ui/react";
import { RiTrelloLine } from "react-icons/ri";
import SelectComponent from "@components/Select";
import SelectVariables from "@components/SelectVariables";

type DataNode = {
  trelloIntegrationId: number;
  varId_cardId: number;
  name?: string;
  desc?: string;
  fields?: string[];
  // labels: { name: string; color: string }[];
};

const optionsFields: { label: string; value: string }[] = [
  { label: "Título do Card", value: "name" },
  { label: "Descrição", value: "desc" },
];

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
    <div className="flex flex-col -mt-3 mb-5 gap-y-3">
      <Field label="Selecione a integração">
        <SelectTrelloIntegrations
          value={data.trelloIntegrationId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, {
              data: { ...data, trelloIntegrationId: v.value },
            });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>

      <Field label="Selecione a variável com o ID do card">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_cardId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_cardId: e.value },
            });
          }}
        />
      </Field>

      {data.fields?.includes("name") && (
        <Field label="Novo título do Card">
          <Input
            defaultValue={data.name || ""}
            onChange={({ target }) => {
              updateNode(id, {
                data: { ...data, name: target.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("desc") && (
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["/", "{{"]}
          maxOptions={20}
          matchAny
          options={{
            "{{": variables?.map((s) => s.name + "}} ") || [],
          }}
          maxRows={14}
          minRows={5}
          defaultValue={data.desc || ""}
          type="textarea"
          placeholder={`Descrição`}
          onChange={async (target: string) => {
            setDataMok({
              ...data,
              desc: target,
            });
          }}
        />
      )}

      <Field label={"Selecione os campos"}>
        <SelectComponent
          options={optionsFields}
          placeholder="Selecione os campos para editar"
          isMulti
          isFlow
          value={(data.fields || [])?.map((s) => ({
            label: optionsFields.find((o) => o.value === s)?.label || "",
            value: s,
          }))}
          onChange={(vl: any) => {
            updateNode(id, {
              data: { ...data, fields: vl.map((s: any) => s.value) },
            });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeUpdateTrelloCard: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Atualizar card no Trello"
        description="Atualiza card do trello"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="320px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiTrelloLine
                className="dark:text-blue-400  text-blue-500"
                size={31}
              />
            </div>
          ),
          name: "Card",
          description: "Atualizar",
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
