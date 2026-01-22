import { Button } from "@chakra-ui/react";
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
// import SelectBusinesses from "@components/SelectBusinesses";
import SelectComponent from "@components/Select";
import { TiFlash } from "react-icons/ti";
import SelectVariables from "@components/SelectVariables";

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

type DataNode = {
  businessId: number;
  title: string;
  desc?: string;
  status: StatusAppointments;
  startAt: string;
  // endAt: string;
  varId_save_nAppointment?: number;
  actionChannels: { key: string; text: string }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode } = useStore((s) => ({
    updateNode: s.updateNode,
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
      {/* <Field label="Projeto" required>
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
      </Field> */}

      <Field label="Título do agendamento" required>
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

      <Field
        label="Data do agendamento"
        required
        helperText="Formato YYYY-MM-DDTHH:mm (ISO 8601)."
      >
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          placeholder="YYYY-MM-DDTHH:mm ou {{data_agendamento}}"
          defaultValue={data.startAt || ""}
          onChange={(value: string) => setDataMok({ ...data, startAt: value })}
        />
      </Field>

      <Field label={"Situação"} required>
        <SelectComponent
          options={optionsStatus}
          placeholder="Agendado"
          isMulti={false}
          isFlow
          value={
            data.status
              ? {
                  value: data.status,
                  label:
                    optionsStatus.find((s) => s.value === data.status)?.label ||
                    "",
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

      <Field label="Salvar o código do agendamento">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          isFlow
          menuPlacement="bottom"
          filter={(opt) => opt.filter((s) => s.type === "dynamics")}
          onCreate={(tag) => {
            updateNode(id, {
              data: { ...data, varId_save_nAppointment: tag.id },
            });
          }}
          value={data.varId_save_nAppointment}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_save_nAppointment: e.value },
            });
          }}
        />
      </Field>

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
                        ...data,
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
        Ações não mudam o fluxo de direção. Use para notificar ou executar
        funções por debaixo dos panos.
      </span>
    </div>
  );
}

export const NodeCreateAppointment: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de agendamento"
        description="Cria um novo agendamento"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LuCalendarDays className="text-green-400" size={31} />
            </div>
          ),
          name: "Evento",
          description: "Agendar",
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
        handleId={`#b99909 action`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 30 }}
        isConnectable={true}
        className="border-yellow-400/60! bg-yellow-400/15!"
      />

      <CustomHandle
        nodeId={id}
        handleId={`#0ea4e9c6 confirmed`}
        position={Position.Right}
        type="source"
        style={{ right: -57, top: 44 + 14 }}
        isConnectable={true}
        className="border-[#0ea4e9c6]! bg-[#0ea4e9c6]/15!"
      />
      <span className="font-semibold text-[#0ea4e9c6] text-[8px] absolute -right-12.5 top-13">
        Confirmado
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`#22c55eef completed`}
        position={Position.Right}
        type="source"
        style={{ right: -38, top: 44 + 14 * 2 }}
        isConnectable={true}
        className="border-[#22c55eef]! bg-[#22c55eef]/15!"
      />
      <span className="font-semibold text-[#22c55eef] text-[8px] absolute -right-7.5 top-16.25">
        Concluído
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`#f63b3bf9 canceled`}
        position={Position.Right}
        type="source"
        style={{ right: -51, top: 44 + 14 * 3 }}
        isConnectable={true}
        className="border-[#f63b3bf9]! bg-[#f63b3bf9]/15!"
      />
      <span className="font-semibold text-[#f63b3bfa] text-[8px] absolute -right-10.75 top-19.75">
        Cancelado
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`#91aba8 expired`}
        position={Position.Right}
        type="source"
        style={{ right: -51, top: 44 + 14 * 4 }}
        isConnectable={true}
        className="border-[#426561]! bg-[#426561]/15!"
      />
      <span className="font-semibold text-[#91aba8] text-[8px] absolute -right-10.5 top-23.25">
        Expirado
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`#91aba8 day`}
        position={Position.Right}
        type="source"
        style={{ right: -51, top: 44 + 13 * 6 }}
        isConnectable={true}
        className="border-[#426561]! bg-[#426561]/15!"
      />
      <span className="font-semibold text-[#91aba8] text-[8px] absolute -right-10.5 top-28.75">
        1 dia
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`#91aba8 hour`}
        position={Position.Right}
        type="source"
        style={{ right: -51, top: 44 + 13 * 7 }}
        isConnectable={true}
        className="border-[#426561]! bg-[#426561]/15!"
      />
      <span className="font-semibold text-[#91aba8] text-[8px] absolute -right-10.5 top-32">
        2 horas
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`#91aba8 minute`}
        position={Position.Right}
        type="source"
        style={{ right: -51, top: 44 + 13 * 8 }}
        isConnectable={true}
        className="border-[#426561]! bg-[#426561]/15!"
      />
      <span className="font-semibold text-[#91aba8] text-[8px] absolute -right-10.5 top-35.5">
        30 min
      </span>
    </div>
  );
};
