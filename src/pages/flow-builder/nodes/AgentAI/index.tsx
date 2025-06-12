import { JSX } from "react";
import { Handle, Node, Position, useUpdateNodeInternals } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { useDBNodes } from "../../../../db";
import useStore from "../../flowStore";
import { RxLapTimer } from "react-icons/rx";
import { useColorModeValue } from "@components/ui/color-mode";
import { CustomHandle } from "../../customs/node";
import { LuBrainCircuit } from "react-icons/lu";
import SelectAgentsAI from "@components/SelectAgentsAI";
import { Field } from "@components/ui/field";
import AutocompleteTextField from "@components/Autocomplete";

type DataNode = {
  prompt?: string;
  agentId: number;
};

const itemsCorporation = [
  { name: "[atribuir_variavel, <Nome da variavel>, <Qual o valor?>" },
  { name: "[add_var, <Nome da variavel>, <Qual o valor?>" },
  { name: "[remove_variavel, <Nome da variavel>" },
  { name: "[remove_var, <Nome da variavel>" },
  { name: "[add_tag, <Nome da etiqueta>" },
  { name: "[add_etiqueta, <Nome da etiqueta>" },
  { name: "[remove_tag, <Nome da etiqueta>" },
  { name: "[remove_etiqueta, <Nome da etiqueta>" },
  { name: "[notificar_wa, <Número de WhatsApp>, <Mensagem>" },
  { name: '[notify_wa, <999999999>, "<MSG>"' },
  { name: "[pausar, <VALOR>, <Qual o tipo de tempo?>" },
  // { name: '[if, ""' },
  { name: "[sair_node, <Nome da saída>" },
];

function pickExistNode(text: string) {
  const math = text.match(/\/\[sair_node,\s(.+)\]/g);
  if (!math) return [];
  return math.map((s) => s.replace(/\/\[sair_node,\s(.+)\]/, "$1"));
}

function BodyNode({ id }: { id: string }): JSX.Element {
  const updateNodeInternals = useUpdateNodeInternals();
  const nodes = useDBNodes();
  // const variables = useVariables();
  const { updateNode, delEdge } = useStore((s) => ({
    updateNode: s.updateNode,
    delEdge: s.delEdge,
  }));
  const node = nodes.find((s) => s.id === id) as
    | (Node<DataNode> & { preview?: string[] })
    | undefined;

  const getNodePreview = useStore((s) => s.getNodePreview);
  const preview = getNodePreview(id);

  if (!node) return <span>Não encontrado</span>;

  return (
    <div className="flex flex-col -mt-3 mb-5 gap-y-3">
      <Field label="Selecione o agente IA">
        <SelectAgentsAI
          value={node.data.agentId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, {
              ...node,
              data: { ...node.data, agentId: v.value },
            });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>

      <div className="flex flex-col items-center">
        <span className="font-semibold text-center">Instruções do agente</span>
        <span className="text-center text-white/70">
          Essas instruções serão priorizadas em relação as que já estão salvas
          no escopo do agente IA
        </span>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["/"]}
          spacer={"] "}
          maxOptions={20}
          matchAny
          options={{ "/": itemsCorporation.map((s) => s.name) }}
          maxRows={14}
          minRows={5}
          defaultValue={node.data.prompt || ""}
          type="textarea"
          placeholder={`- Faça /[add_tag, LEAD_FRIO], ao inicia a conversa`}
          // @ts-expect-error
          onBlur={async ({ target }) => {
            const listExistNode = pickExistNode(target.value);
            const itemsDell = preview?.property?.filter(
              (s: string) => !listExistNode.includes(s)
            );
            console.log("itemsDell", itemsDell);
            for await (const item of itemsDell || []) {
              delEdge(item);
              updateNodeInternals(id);
            }
            updateNode(id, {
              ...node,
              preview: {
                ...preview,
                property: listExistNode,
              },
              data: { ...node.data, prompt: target.value },
            });
            updateNodeInternals(id);
          }}
        />
        <span className="text-white/70 text-center">
          Digite <strong className="text-green-400">/</strong> para abrir o menu
          de ferramentas.
        </span>
      </div>
    </div>
  );
}

export const NodeAgentAI: React.FC<Node<DataNode>> = ({ id }) => {
  const getNodePreview = useStore((s) => s.getNodePreview);
  const preview = getNodePreview(id) as { first: string[]; property: string[] };
  const colorTimeout = useColorModeValue("#F94A65", "#B1474A");
  // const colorFailed = useColorModeValue("#ee9e42", "#a55d29");

  const previewUnique = [
    ...new Set([...(preview?.first || []), ...(preview?.property || [])]),
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
              <LuBrainCircuit
                className="dark:text-teal-700  text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Agente IA",
          description: "Chama",
        }}
      >
        <BodyNode id={id} />
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
        className="relative dark:text-red-400 text-red-500 dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      >
        <RxLapTimer
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
    </div>
  );
};
