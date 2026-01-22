import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { CustomHandle } from "../../customs/node";
import { HiOutlineQueueList } from "react-icons/hi2";
import { MdHourglassEmpty, MdHourglassFull } from "react-icons/md";
import { NumberInput } from "@chakra-ui/react";
import useStore from "../../flowStore";

type DataNode = {
  value: number;
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
      <div className="grid grid-cols-[1fr_43px] gap-x-1 w-full justify-between">
        <div className="flex flex-col">
          <span className="font-medium">Segundos de debounce</span>
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
      </div>
    </div>
  );
}

export const NodeTimedQueue: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de fila debounce"
        description="Cria uma fila de antirepique"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <HiOutlineQueueList
                className="dark:text-white text-black/70"
                size={26.8}
              />
            </div>
          ),
          name: "Debounce",
          description: "Fila",
        }}
      >
        <BodyNode id={id} data={data} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      <CustomHandle
        nodeId={id}
        handleId={`main`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 15 }}
        isConnectable={true}
        className="relative dark:!border-blue-400/60 text-blue-400 dark:!bg-blue-400/15 !border-blue-500/70 !bg-blue-500/15"
      >
        <MdHourglassFull
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
      <CustomHandle
        nodeId={id}
        handleId={`debounce`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: 11, top: "initial" }}
        isConnectable={true}
        className="relative dark:!border-red-400/60 text-red-400 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
      >
        <MdHourglassEmpty
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
    </div>
  );
};
