import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
import { FaRoute } from "react-icons/fa";

const optionsStatus: {
  label: string;
  value: "open" | "awaiting_assignment" | "in_progress" | "finished";
}[] = [
  { label: "Aberta", value: "open" },
  { label: "Aguardando atribuição", value: "awaiting_assignment" },
  { label: "Em processamento", value: "in_progress" },
  { label: "Finalizada", value: "finished" },
];

const optionsFields: { label: string; value: string }[] = [
  { label: "Status", value: "status" },
  { label: "QNT máxima de locais", value: "qnt_max" },
  { label: "Atribuir ao contato", value: "assign_to_contact" },
  { label: "Adicionar pedido a rota", value: "add_order" },
];

type DataNode = {
  nRouter: string;
  max?: string;
  nOrder?: string;
  status?: "open" | "awaiting_assignment" | "in_progress" | "finished";
  fields?: string[];
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
    <div className="flex flex-col gap-y-3 -mt-3">
      <Field label="Código da rota">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite o código da rota"
          defaultValue={data.nRouter || ""}
          onChange={(value: string) => setDataMok({ ...data, nRouter: value })}
        />
      </Field>

      {data.fields?.includes("max") && (
        <Field label="Nome do pedido">
          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}} "}
            placeholder="Digite o nome ou {{max}}"
            defaultValue={data.max || ""}
            onChange={(value: string) => setDataMok({ ...data, max: value })}
          />
        </Field>
      )}

      {data.fields?.includes("status") && (
        <Field label={"Status"}>
          <SelectComponent
            options={optionsStatus}
            placeholder="Pendente"
            isMulti={false}
            isFlow
            value={
              data.status
                ? {
                    value: data.status,
                    label:
                      optionsStatus.find((s) => s.value === data.status)
                        ?.label || "",
                  }
                : null
            }
            onChange={(vl: any) => {
              if (!vl) {
                updateNode(id, { data: { ...data, status: undefined } });
                return;
              }
              updateNode(id, { data: { ...data, status: vl.value } });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("add_order") && (
        <Field label="Adicionar pedido a rota">
          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}}"}
            placeholder="Digite o status do pedido"
            defaultValue={data.nOrder || ""}
            onChange={(value: string) => setDataMok({ ...data, nOrder: value })}
          />
        </Field>
      )}

      {data.fields?.includes("assign_to_contact") && (
        <span>O contato será endereçado a rota</span>
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

export const NodeUpdateRouter: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de atualizar rota"
        description="Atualiza rota"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-1.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <FaRoute className="text-blue-400" size={23} />
            </div>
          ),
          name: "Rota",
          description: "Atualiza",
        }}
      >
        <BodyNode data={data} id={id} />
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
