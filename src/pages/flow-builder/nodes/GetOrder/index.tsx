import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { LuNotepadText } from "react-icons/lu";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
import SelectVariables from "@components/SelectVariables";
import { TiFlash } from "react-icons/ti";

const optionsFields: { label: string; value: string }[] = [
  { label: "Nome", value: "name" },
  { label: "Status", value: "status" },
  { label: "Método de pagamento", value: "payment_method" },
  { label: "Endereço de entrega", value: "delivery_address" },
  { label: "Total", value: "total" },
  { label: "Conteúdo", value: "data" },
  { label: "Número do contato", value: "number_contact" },
  { label: "Código da rota", value: "router_code" },
  { label: "Código de entrega", value: "delivery_code" },
  { label: "Código do pedido", value: "nOrder" },
  { label: "Tipo do código", value: "type_code" },
];

type DataNode = {
  nOrder_deliveryCode: string;
  fields?: string[];

  varId_save_name?: number; //
  varId_save_router_code?: number; //
  varId_save_status?: number; //
  varId_save_payment_method?: number; //
  varId_save_delivery_address?: number; //
  varId_save_total?: number; //
  varId_save_data?: number; //
  varId_save_number_contact?: number; //
  varId_save_delivery_code?: number; //
  varId_save_nOrder?: number; //
  varId_save_type_code?: number; //
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
      <Field
        label="Código"
        helperText={"Código do pedido ou Código de entrega"}
      >
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite o código"
          defaultValue={data.nOrder_deliveryCode || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, nOrder_deliveryCode: value })
          }
        />
      </Field>

      {data.fields?.includes("type_code") && (
        <Field
          label="Salvar tipo do codigo"
          helperText={'"code_delivery" ou "code_order"'}
        >
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_type_code: tag.id },
              });
            }}
            value={data.varId_save_type_code}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_type_code: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("name") && (
        <Field label="Salvar NOME">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, { data: { ...data, varId_save_name: tag.id } });
            }}
            value={data.varId_save_name}
            onChange={(e: any) => {
              updateNode(id, { data: { ...data, varId_save_name: e.value } });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("status") && (
        <Field label="Salvar STATUS">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, { data: { ...data, varId_save_status: tag.id } });
            }}
            value={data.varId_save_status}
            onChange={(e: any) => {
              updateNode(id, { data: { ...data, varId_save_status: e.value } });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("payment_method") && (
        <Field label="Salvar METODO DE PAGAMENTO">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_payment_method: tag.id },
              });
            }}
            value={data.varId_save_payment_method}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_payment_method: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("router_code") && (
        <Field label="Salvar código da rota">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_router_code: tag.id },
              });
            }}
            value={data.varId_save_router_code}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_router_code: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("delivery_address") && (
        <Field label="Salvar ENDEREÇO DE ENTREGA">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_address: tag.id },
              });
            }}
            value={data.varId_save_delivery_address}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_address: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("total") && (
        <Field label="Salvar TOTAL">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, { data: { ...data, varId_save_total: tag.id } });
            }}
            value={data.varId_save_total}
            onChange={(e: any) => {
              updateNode(id, { data: { ...data, varId_save_total: e.value } });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("data") && (
        <Field label="Salvar CONTEÚDO">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, { data: { ...data, varId_save_data: tag.id } });
            }}
            value={data.varId_save_data}
            onChange={(e: any) => {
              updateNode(id, { data: { ...data, varId_save_data: e.value } });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("number_contact") && (
        <Field label="Salvar NUMERO DO LEAD">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_number_contact: tag.id },
              });
            }}
            value={data.varId_save_number_contact}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_number_contact: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("nOrder") && (
        <Field label="Salvar codigo do pedido">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_nOrder: tag.id },
              });
            }}
            value={data.varId_save_nOrder}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_nOrder: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("delivery_code") && (
        <Field label="Salvar codigo de entrega">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_code: tag.id },
              });
            }}
            value={data.varId_save_delivery_code}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_delivery_code: e.value },
              });
            }}
          />
        </Field>
      )}

      <Field label={"Selecione os campos"}>
        <SelectComponent
          options={optionsFields}
          placeholder="Selecione os campos para recuperar"
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

export const NodeGetOrder: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de buscar pedido"
        description="Busca um pedido existente"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LuNotepadText className="text-gray-400" size={31} />
            </div>
          ),
          name: "Pedido",
          description: "Buscar",
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
        style={{ right: -9, top: 11 }}
        isConnectable={true}
      />
      <span className="absolute -right-3.75 top-6 text-yellow-400">
        <TiFlash size={13} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`#b99909 not_found`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 30 }}
        isConnectable={true}
        className="border-yellow-400/60! bg-yellow-400/15!"
      />
    </div>
  );
};
