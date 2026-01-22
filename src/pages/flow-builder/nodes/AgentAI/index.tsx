import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position, useUpdateNodeInternals } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { RxLapTimer } from "react-icons/rx";
import { useColorModeValue } from "@components/ui/color-mode";
import { CustomHandle } from "../../customs/node";
import SelectAgentsAI from "@components/SelectAgentsAI";
import { Field } from "@components/ui/field";
import AutocompleteTextField from "@components/Autocomplete";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { BsStars } from "react-icons/bs";

type DataNode = {
  prompt?: string;
  agentId: number;
  preview?: { first?: string[]; property: string[] };
};

const itemsCorporation = [
  { name: "[add_var, <Nome da variavel>, <Qual o valor?>]" },
  { name: "[rm_var, <Nome da variavel>]" },
  { name: "[add_tag, <Nome da etiqueta>]" },
  { name: "[rm_tag, <Nome da etiqueta>]" },
  { name: "[sair_node, <Nome da saída>]" },
];

function pickExistNode(text: string) {
  const math = text.match(/\/\[sair_node,\s(.+)\]/g);
  if (!math) return [];
  return math.map((s) => s.replace(/\/\[sair_node,\s(.+)\]/, "$1"));
}

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNode, delEdge } = useStore((s) => ({
    updateNode: s.updateNode,
    delEdge: s.delEdge,
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
    <div className="flex flex-col -mt-3 mb-5 gap-y-3">
      <Field label="Selecione o agente IA">
        <SelectAgentsAI
          value={data.agentId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, {
              data: { ...data, agentId: v.value },
            });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>

      <div className="flex flex-col items-center">
        <span className="font-semibold text-center">
          Instrução direta pro agente
        </span>
        <span className="text-center text-white/70">
          Essas instruções serão priorizadas em relação as que já estão salvas
          no escopo do agente IA
        </span>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["/", "{{"]}
          maxOptions={20}
          matchAny
          options={{
            "/": itemsCorporation.map((s) => s.name),
            "{{": variables?.map((s) => s.name + "}} ") || [],
          }}
          maxRows={14}
          minRows={5}
          defaultValue={data.prompt || ""}
          type="textarea"
          placeholder={`- Faça /[add_tag, LEAD_FRIO], ao inicia a conversa`}
          onChange={async (target: string) => {
            const listExistNode = pickExistNode(target);
            const itemsDell = data.preview?.property?.filter(
              (s: string) => !listExistNode.includes(s),
            );
            for await (const item of itemsDell || []) {
              delEdge(item);
              updateNodeInternals(id);
            }
            setDataMok({
              ...data,
              prompt: target,
              preview: { ...data.preview, property: listExistNode },
            });
            updateNodeInternals(id);
          }}
        />
        <span className="text-white/70 text-center">
          Digite <strong className="text-green-400">/</strong> para abrir o menu
          de ferramentas.
        </span>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-yellow-400 uppercase">
          ⚠️ Importante !
        </span>
        <span className=" text-white/70">
          Quanto mais nodes o contato percorre desse agente, mais{" "}
          <span className="text-white font-medium">Instrução direta</span> entra
          no histórico.
        </span>
        <span className=" text-white/70">
          Isso faz o agente lembrar de tudo que já foi dito nesse fluxo,
          incluindo as{" "}
          <span className="text-white font-medium">Instrução direta</span>.
        </span>
      </div>
    </div>
  );
}

export const NodeAgentAI: React.FC<
  Node<DataNode & { preview: { first: string[]; property: string[] } }>
> = ({ id, data }) => {
  const colorTimeout = useColorModeValue("#F94A65", "#B1474A");
  // const colorFailed = useColorModeValue("#ee9e42", "#a55d29");

  const previewUnique = [
    ...new Set([
      ...(data.preview?.first || []),
      ...(data.preview?.property || []),
    ]),
  ];

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de agente IA"
        description="Chame um agente IA"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="380px"
        node={{
          children: (
            <div
              style={{
                height:
                  previewUnique?.length >= 2
                    ? 14 * previewUnique?.length + 50 - 35
                    : 35,
              }}
              className="p-0.5 relative flex items-center"
            >
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <BsStars
                className="dark:text-teal-700  text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Agente IA",
          description: "Chama",
        }}
      >
        <BodyNode id={id} data={data} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      {previewUnique.map((name: string, index: number) => (
        <CustomHandle
          nodeId={id}
          handleId={name}
          title={name}
          key={name}
          isConnectable={true}
          type="source"
          position={Position.Right}
          style={{ right: -34, top: 14 * index + 6 }}
          className="relative"
        >
          <div
            style={{ fontSize: 9, top: -3, left: -27.8 }}
            className="absolute cursor-default w-6 justify-between text-white/50 flex items-center -left-[30.8px] font-medium"
          >
            <span style={{ fontSize: 9 }}>{"["}</span>
            <span style={{ fontSize: 6 }} className="">
              {name.split("").splice(0, 3)}
            </span>
            <span style={{ fontSize: 9 }}>{"]"}</span>
          </div>
        </CustomHandle>
      ))}

      <CustomHandle
        nodeId={id}
        handleId={`${colorTimeout} timeout`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: -3, top: "initial" }}
        isConnectable={true}
        title="Tempo esgotado"
        className="relative dark:text-red-400 text-red-500 dark:border-red-400/60! dark:bg-red-400/15! border-red-500/70! bg-red-500/15!"
      >
        <RxLapTimer
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
    </div>
  );
};
