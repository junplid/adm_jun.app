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
import { LuCalendarDays } from "react-icons/lu";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";

type StatusAppointments =
  | "suggested"
  | "pending_confirmation"
  | "confirmed"
  | "canceled"
  | "completed"
  | "expired";

const optionsStatus: { label: string; value: StatusAppointments }[] = [
  // { label: "Sugerido", value: "suggested" },
  { label: "Agendado", value: "pending_confirmation" },
  { label: "Confirmado", value: "confirmed" },
  { label: "Concluído", value: "completed" },
  { label: "Cancelado", value: "canceled" },
  { label: "Expirado", value: "expired" },
];

const optionsFields: { label: string; value: string }[] = [
  { label: "Título", value: "title" },
  { label: "Descrição", value: "desc" },
  { label: "Situação", value: "status" },
  { label: "Data do agendamento", value: "startAt" },
  // { label: "Data do evento", value: "endAt" },
  { label: "Ações do agendamento", value: "actionChannels" },
  { label: "Arrastar e soltar", value: "dragDrop" },
];

type DataNode = {
  title?: string;
  desc?: string;
  status?: StatusAppointments;
  startAt?: string;
  // endAt: string;
  n_appointment?: string;
  actionChannels: { key: string; text: string }[];
  fields?: string[];
  transfer_direction?: boolean;
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
      <Field label="Código do agendamento">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite o código do agendamento"
          defaultValue={data.n_appointment || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, n_appointment: value })
          }
        />
      </Field>

      {data.fields?.includes("title") && (
        <Field label="Título do agendamento">
          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}} "}
            placeholder="Digite o título ou {{nome}}"
            defaultValue={data.title || ""}
            onChange={(value: string) => setDataMok({ ...data, title: value })}
          />
        </Field>
      )}

      {data.fields?.includes("startAs") && (
        <Field
          label="Nova data do agendamento"
          required
          helperText="Use o formato YYYY-MM-DDTHH:mm (ISO 8601)."
        >
          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}} "}
            placeholder="YYYY-MM-DDTHH:mm ou {{data_evento}}"
            defaultValue={data.title || ""}
            onChange={(value: string) =>
              setDataMok({ ...data, startAt: value })
            }
          />
        </Field>
      )}

      {data.fields?.includes("status") && (
        <Field label={"Situação"}>
          <SelectComponent
            options={optionsStatus}
            placeholder="Selecione"
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

      {data.status &&
        ["confirmed", "completed", "canceled", "expired"].some((s) =>
          data.status?.includes(s),
        ) && (
          <Field
            helperText={"Para a saída de status do Node de Agendar Evento"}
          >
            <Checkbox.Root
              onCheckedChange={(e) =>
                updateNode(id, {
                  data: { ...data, transfer_direction: !!e.checked },
                })
              }
              checked={!!data.transfer_direction}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Transferir direção do fluxo</Checkbox.Label>
            </Checkbox.Root>
          </Field>
        )}

      {data.fields?.includes("desc") && (
        <Field label="Descrição">
          <AutocompleteTextField
            // @ts-expect-error
            trigger={["{{"]}
            options={{ "{{": variables?.map((s) => s.name) || [] }}
            spacer={"}} "}
            type="textarea"
            placeholder="Digite a descrição ou {{descricao}}"
            defaultValue={data.desc || ""}
            onChange={(value: string) => setDataMok({ ...data, desc: value })}
          />
        </Field>
      )}

      {data.fields?.includes("actionChannels") && (
        <>
          <div className="border-b-2 mt-3 border-dashed border-zinc-800/70" />
          <div className="mt-3 flex flex-col gap-y-2">
            {data.actionChannels?.length ? (
              <div>
                <span className="block w-full text-center mb-1 font-medium">
                  Ações do agendamento
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
                              (s) => s.key !== msg.key,
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
                      options={{ "{{": variables?.map((s) => s.name) || [] }}
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
              <span className="text-white/70">
                As ações do agendamento serão todas deletadas*
              </span>
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
        </>
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

export const NodeUpdateAppointment: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de atualizar agendamento"
        description="Atualiza agendamento"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LuCalendarDays
                className="dark:text-blue-400 text-blue-700"
                size={31}
              />
            </div>
          ),
          name: "Evento",
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
