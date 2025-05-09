import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiFlowArrowBold } from "react-icons/pi";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  // SelectValueText,
} from "@components/ui/select";
import { createListCollection, Select, Span, Stack } from "@chakra-ui/react";
import useStore from "../../flowStore";
import { JSX } from "react";
import { useDBNodes, useFlows } from "../../../../db";

type DataNode = {
  id: number;
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;
  const flows = useFlows();

  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));

  const collection = createListCollection({
    items: flows.map((s) => ({
      label: s.name,
      value: String(s.id),
    })),
  });

  if (!node) {
    return <span>Não encontrado</span>;
  }

  return (
    <div className="flex flex-col -mt-3">
      <SelectRoot
        defaultValue={[String(node.data.id)]}
        onValueChange={(e) => {
          updateNode(id, {
            data: { id: Number(e.value[0]) },
          });
        }}
        collection={collection}
        className="!gap-1"
      >
        <SelectLabel className="p-0 m-0">Selecione o fluxo</SelectLabel>
        <SelectTrigger>
          <SelectValueText placeholder="Selecione o" />
        </SelectTrigger>
        <SelectContent>
          {collection.items.map((time) => (
            <SelectItem item={time} key={time.value}>
              <Stack gap="0">
                <Select.ItemText>{time.label}</Select.ItemText>
              </Stack>
            </SelectItem>
          ))}
          {!collection.items.length && (
            <div className="flex items-center justify-center w-full h-12">
              <Span color="fg.muted" textStyle="xs">
                Nenhum fluxo encontrado
              </Span>
            </div>
          )}
        </SelectContent>
      </SelectRoot>
    </div>
  );
}

export const NodeSendFlow: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar fluxo"
        description="Transferir a conversa para outro fluxo"
        node={{
          children: (
            <div className="p-1">
              <PiFlowArrowBold
                className="dark:text-neutral-300 text-neutral-800"
                size={26.8}
              />
            </div>
          ),
          name: "Fluxo",
          description: "Enviar",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
    </div>
  );
};
