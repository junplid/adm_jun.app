import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
import SelectVariables from "@components/SelectVariables";
import { TiFlash } from "react-icons/ti";
import { FaRoute } from "react-icons/fa";

const optionsFields: { label: string; value: string }[] = [
  { label: "Status", value: "status" },
  { label: "QNT total de pedidos", value: "count_total_orders" },
  { label: "QNT de pedidos com status:", value: "count_order_status_of" },
  { label: "Ganho total", value: "gain_total" },
  { label: "Link Rota", value: "link_router" },
  { label: "Link Rota atualizada", value: "link_router_updated" },
  { label: "Data text", value: "data_text" }, // texto tentendo todos os pedidos(status_router_pedido\n#code_pedido\nEndereço\nNome\nPedido\n\n)
  { label: "Número do contato atribuido", value: "number_contact" }, // texto tentendo todos os pedidos(status_router_pedido\n#code_pedido\nEndereço\nNome\nPedido\n\n)
  { label: "Link de aceitar rota", value: "link_join_router" }, // texto tentendo todos os pedidos(status_router_pedido\n#code_pedido\nEndereço\nNome\nPedido\n\n)
];

type DataNode = {
  nRouter: string;
  fields?: string[];

  varId_save_status?: number; //
  varId_save_count_total_orders?: number; //
  varId_save_count_order_status_of?: number; //
  order_status_of?: string; //
  varId_save_link_router?: number; //
  varId_save_link_router_updated?: number; //
  varId_save_data_text?: number; //
  varId_save_number_contact?: number; //
  varId_save_link_join_router?: number;
  varId_save_gain_total?: number;
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
          placeholder="Digite o código do pedido"
          defaultValue={data.nRouter || ""}
          onChange={(value: string) => setDataMok({ ...data, nRouter: value })}
        />
      </Field>

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

      {data.fields?.includes("count_total_orders") && (
        <Field label="Salvar QNT de pontos">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_count_total_orders: tag.id },
              });
            }}
            value={data.varId_save_count_total_orders}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_count_total_orders: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("count_order_status_of") && (
        <div className="p-2 bg-neutral-600/10 flex flex-col gap-y-2">
          <Field label="Quantidade de pedidos com status:">
            <AutocompleteTextField
              // @ts-expect-error
              trigger={["{{"]}
              options={{ "{{": variables?.map((s) => s.name) || [] }}
              spacer={"}}"}
              placeholder="Digite o status do pedido"
              defaultValue={data.order_status_of || ""}
              onChange={(value: string) =>
                setDataMok({ ...data, order_status_of: value })
              }
            />
          </Field>
          <Field label="Salvar valor na variável">
            <SelectVariables
              isMulti={false}
              isClearable={false}
              isFlow
              menuPlacement="bottom"
              filter={(opt) => opt.filter((s) => s.type === "dynamics")}
              onCreate={(tag) => {
                updateNode(id, {
                  data: { ...data, varId_save_count_order_status_of: tag.id },
                });
              }}
              value={data.varId_save_count_order_status_of}
              onChange={(e: any) => {
                updateNode(id, {
                  data: { ...data, varId_save_count_order_status_of: e.value },
                });
              }}
            />
          </Field>
        </div>
      )}

      {data.fields?.includes("gain_total") && (
        <Field label="Salvar Ganho total">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_gain_total: tag.id },
              });
            }}
            value={data.varId_save_gain_total}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_gain_total: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("link_router") && (
        <Field label="Salvar Link da rota">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_link_router: tag.id },
              });
            }}
            value={data.varId_save_link_router}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_link_router: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("link_router_updated") && (
        <Field label="Salvar Link da rota atualizada">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_link_router_updated: tag.id },
              });
            }}
            value={data.varId_save_link_router_updated}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_link_router_updated: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("data_text") && (
        <Field label="Salvar Link da rota atualizada">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_data_text: tag.id },
              });
            }}
            value={data.varId_save_data_text}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_data_text: e.value },
              });
            }}
          />
        </Field>
      )}

      {data.fields?.includes("number_contact") && (
        <Field label="Número do contato atribuido">
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

      {data.fields?.includes("link_join_router") && (
        <Field label="Link de aceitar rota">
          <SelectVariables
            isMulti={false}
            isClearable={false}
            isFlow
            menuPlacement="bottom"
            filter={(opt) => opt.filter((s) => s.type === "dynamics")}
            onCreate={(tag) => {
              updateNode(id, {
                data: { ...data, varId_save_link_join_router: tag.id },
              });
            }}
            value={data.varId_save_link_join_router}
            onChange={(e: any) => {
              updateNode(id, {
                data: { ...data, varId_save_link_join_router: e.value },
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

export const NodeGetRouter: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de buscar rota"
        description="Busca uma rota existente"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-1.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <FaRoute className="text-gray-400" size={23} />
            </div>
          ),
          name: "Rota",
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
