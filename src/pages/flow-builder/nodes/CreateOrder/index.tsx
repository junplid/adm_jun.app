import { Button, Checkbox } from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { IoIosCloseCircle } from "react-icons/io";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { LuNotepadText } from "react-icons/lu";
import {
  TypePriorityOrder,
  TypeStatusOrder,
} from "../../../../services/api/Orders";
import { Field } from "@components/ui/field";
import SelectBusinesses from "@components/SelectBusinesses";
import SelectComponent from "@components/Select";
import SelectVariables from "@components/SelectVariables";
import { TiFlash } from "react-icons/ti";
import { useColorModeValue } from "@components/ui/color-mode";

const optionsStatus: { label: string; value: TypeStatusOrder }[] = [
  { label: "Rascunho", value: "draft" },
  { label: "Pendente", value: "pending" },
  { label: "Em processamento", value: "processing" },
  { label: "Confirmado", value: "confirmed" },
  { label: "Enviado", value: "shipped" },
  { label: "Entregue", value: "delivered" },
  { label: "Cancelado", value: "cancelled" },
  { label: "Devolvido", value: "returned" },
];

const optionsPriority: { label: string; value: TypePriorityOrder }[] = [
  { label: "Baixa", value: "low" },
  { label: "Média", value: "medium" },
  { label: "Alta", value: "high" },
  { label: "Urgente", value: "urgent" },
  { label: "Crítica", value: "critical" },
];

type DataNode = {
  businessId: number;
  data?: string;
  total?: string;
  name?: string;
  description?: string;
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
  origin?: string;
  delivery_address?: string;
  itens_count?: number;
  charge_transactionId?: string;
  varId_save_nOrder?: number;
  notify?: boolean;
  delivery_method?: string;
  actionChannels: { key: string; text: string }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode, businessIds } = useStore((s) => ({
    updateNode: s.updateNode,
    businessIds: s.businessIds,
  }));
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
      <Field label="Projeto" required>
        <SelectBusinesses
          isMulti={false}
          isClearable={false}
          isFlow
          menuPlacement="bottom"
          filter={
            businessIds.length
              ? (opt) => opt.filter((s) => businessIds.includes(s.id))
              : undefined
          }
          value={data.businessId}
          onChange={(e: any) => {
            updateNode(id, { data: { ...data, businessId: e.value } });
          }}
        />
      </Field>

      <Field label="Nome do pedido">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="Digite o nome ou {{nome}}"
          defaultValue={data.name || ""}
          onChange={(value: string) => setDataMok({ ...data, name: value })}
        />
      </Field>

      <div className="grid grid-cols-[1fr_100px] gap-x-2">
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
        <Field label={"Prioridade"}>
          <SelectComponent
            options={optionsPriority}
            placeholder="Baixa"
            isMulti={false}
            isFlow
            value={
              data.priority
                ? {
                    value: data.priority,
                    label:
                      optionsPriority.find((s) => s.value === data.priority)
                        ?.label || "",
                  }
                : null
            }
            onChange={(vl: any) => {
              if (!vl) {
                updateNode(id, { data: { ...data, priority: undefined } });
                return;
              }
              updateNode(id, { data: { ...data, priority: vl.value } });
            }}
          />
        </Field>
      </div>

      <Field label="Descrição">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          type="textarea"
          placeholder="Digite a descrição ou {{descricao}}"
          defaultValue={data.description || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, description: value })
          }
        />
      </Field>

      <Field label="Origem do pedido">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="Digite a origem ou {{origem}}"
          defaultValue={data.origin || ""}
          onChange={(value: string) => setDataMok({ ...data, origin: value })}
        />
      </Field>

      <Field label="Método">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="Digite o método ou {{metodo}}"
          defaultValue={data.delivery_method || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, delivery_method: value })
          }
        />
      </Field>

      <Field label="Endereço de entrega">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="Digite o endereço ou {{endereco}}"
          defaultValue={data.delivery_address || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, delivery_address: value })
          }
        />
      </Field>

      <Field label="Total">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="50,00 ou {{total}}"
          defaultValue={data.total || ""}
          onChange={(value: string) => setDataMok({ ...data, total: value })}
        />
      </Field>

      <Field label="Anexar cobrança ao pedido">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="{{id_transacao}}"
          defaultValue={data.charge_transactionId || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, charge_transactionId: value })
          }
        />
      </Field>

      <Field label="Conteúdo" className="w-full">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          type="textarea"
          placeholder="Digite o conteúdo do pedido."
          defaultValue={data.data || ""}
          onChange={(value: string) => setDataMok({ ...data, data: value })}
        />
      </Field>

      <Field helperText="Envia notificação no painel desse novo pedido">
        <Checkbox.Root
          checked={!!data.notify}
          onCheckedChange={(e) =>
            updateNode(id, { data: { ...data, notify: !!e.checked } })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Notificar o sistema</Checkbox.Label>
        </Checkbox.Root>
      </Field>

      <Field label="Salvar o código do pedido">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          isFlow
          menuPlacement="bottom"
          filter={(opt) => opt.filter((s) => s.type === "dynamics")}
          onCreate={(tag) => {
            updateNode(id, { data: { ...data, varId_save_nOrder: tag.id } });
          }}
          value={data.varId_save_nOrder}
          onChange={(e: any) => {
            updateNode(id, { data: { ...data, varId_save_nOrder: e.value } });
          }}
        />
      </Field>
      <div className="border-b-2 mt-3 border-dashed border-zinc-800/70" />

      <div className="mt-3 flex flex-col gap-y-2">
        {data.actionChannels?.length ? (
          <div>
            <span className="block w-full text-center mb-1 font-medium">
              Ações do pedido
            </span>
            {data.actionChannels!.map((msg, index) => (
              <div
                key={msg.key}
                className="relative group gap-y-2 flex flex-col py-2.5 rounded-sm pl-3"
              >
                <a
                  className="absolute -top-2 -left-2"
                  onClick={() => {
                    updateNode(id, {
                      data: {
                        actionChannels: data.actionChannels!.filter(
                          (s) => s.key !== msg.key
                        ),
                      },
                    });
                  }}
                >
                  <IoIosCloseCircle
                    size={22}
                    className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
                  />
                </a>

                <AutocompleteTextField
                  // @ts-expect-error
                  trigger={["{{"]}
                  options={{ "{{": [] }}
                  spacer={"}} "}
                  placeholder="Digite o nome da ação"
                  defaultValue={msg.text}
                  // @ts-expect-error
                  onChange={(value) => {
                    data.actionChannels[index].text = value;
                    setDataMok({
                      ...data,
                      actionChannels: data.actionChannels,
                    });
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <span className="text-white/70">Suas ações aparecerão aqui.</span>
        )}

        <Button
          onClick={() => {
            updateNode(id, {
              data: {
                ...data,
                actionChannels: [
                  ...(data.actionChannels || []),
                  { key: nanoid(), text: "" },
                ],
              },
            });
          }}
          size={"sm"}
          colorPalette={"green"}
        >
          Adicionar ação
        </Button>
      </div>
      <span className="text-center text-white/70">
        Ações não mudam o fluxo de conversa de direção. Use para notificar ou
        executar funções por debaixo dos panos.
      </span>
    </div>
  );
}

export const NodeCreateOrder: React.FC<Node<DataNode>> = ({ id, data }) => {
  const colorAction = useColorModeValue("#b99909", "#b99909");

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de criar pedido"
        description="Cria um novo pedido"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LuNotepadText
                className="dark:text-green-400 text-green-700"
                size={31}
              />
            </div>
          ),
          name: "Pedido",
          description: "Criar",
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

      <span className="absolute -right-[15px] top-[30px] dark:text-yellow-400 text-yellow-500">
        <TiFlash size={15} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`${colorAction} action`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 37 }}
        isConnectable={true}
        className="dark:!border-yellow-400/60 dark:!bg-yellow-400/15 !border-yellow-500/70 !bg-yellow-500/15"
      />
    </div>
  );
};
