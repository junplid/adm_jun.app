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
} from "@components/ui/select";
import { createListCollection, Select, Span, Stack } from "@chakra-ui/react";
import useStore from "../../flowStore";
import { useEffect } from "react";

type DataNode = {
  id: number;
};

const timesList = createListCollection({
  items: [
    {
      label: "Seg",
      value: "seg",
      description: "Segundos",
    },
    {
      label: "Min",
      value: "min",
      description: "Minutos",
    },
    {
      label: "Hor",
      value: "hor",
      description: "Horas",
    },
  ],
});

export const NodeSendFlow: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);

  useEffect(() => {
    // caso tenho apenas um fluxo, então auto selecione ele!
  }, []);

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
        <div className="flex flex-col -mt-3">
          <SelectRoot
            // @ts-expect-error
            value={data.id}
            defaultValue={["min"]}
            onValueChange={(e) => {
              updateNode(id, {
                data: { id: e.value },
              });
            }}
            collection={timesList}
            className="!gap-1"
          >
            <SelectLabel className="p-0 m-0">Selecione o fluxo</SelectLabel>
            <SelectTrigger>
              <SelectValueText placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {timesList.items.map((time) => (
                <SelectItem item={time} key={time.value}>
                  <Stack gap="0">
                    <Select.ItemText>{time.label}</Select.ItemText>
                    <Span color="fg.muted" textStyle="xs">
                      {time.description}
                    </Span>
                  </Stack>
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
    </div>
  );
};
