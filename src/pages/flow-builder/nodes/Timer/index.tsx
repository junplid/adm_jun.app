import {
  createListCollection,
  NumberInput,
  Span,
  Stack,
} from "@chakra-ui/react";
import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { LiaHourglassHalfSolid } from "react-icons/lia";
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";
import { CustomHandle } from "../../customs/node";

const timesList = createListCollection({
  items: [
    {
      label: "Seg",
      value: "seconds",
      description: "Segundos",
    },
    {
      label: "Min",
      value: "minutes",
      description: "Minutos",
    },
    {
      label: "Hor",
      value: "hours",
      description: "Horas",
    },
    {
      label: "Dia",
      value: "days",
      description: "Dias",
    },
  ],
});

type DataNode = {
  value: number;
  type: ["seconds" | "minutes" | "hours" | "days"];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

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
    <div className="-mt-3 flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_43px_75px] gap-x-1 w-full justify-between">
        <div className="flex flex-col">
          <span className="font-medium">Tempo esperando</span>
          <span className="dark:text-white/70 text-black/50 font-light">
            Para seguir o fluxo
          </span>
        </div>
        <NumberInput.Root
          min={0}
          max={60}
          size={"md"}
          value={data?.value ? String(data.value) : "0"}
          defaultValue="0"
        >
          <NumberInput.Input
            style={{ borderColor: data.value ? "transparent" : "" }}
            maxW={"43px"}
            onChange={({ target }) => {
              setDataMok({ ...data, value: Number(target.value) });
            }}
          />
        </NumberInput.Root>
        <SelectRoot
          value={data?.type}
          onValueChange={(e) => {
            setDataMok({
              ...data,
              // @ts-expect-error
              type: e.value,
            });
          }}
          collection={timesList}
        >
          <SelectTrigger>
            <SelectValueText placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {timesList.items.map((time) => (
              <SelectItem item={time} key={time.value}>
                <Stack gap="0">
                  <SelectItemText>{time.label}</SelectItemText>
                  <Span color="fg.muted" textStyle="xs">
                    {time.description}
                  </Span>
                </Stack>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
    </div>
  );
}

export const NodeTimer: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de aguardar tempo"
        description="Pausar por um tempo e continua o fluxo"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LiaHourglassHalfSolid
                className="dark:text-zinc-400 text-zinc-700"
                size={31}
              />
            </div>
          ),
          description: "Aguardar",
          name: "Tempo",
        }}
        size="300px"
      >
        <BodyNode id={id} data={data} />
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
