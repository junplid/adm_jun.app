import { JSX } from "react";
import { IoIosCloseCircle, IoMdAdd } from "react-icons/io";
import { PatternNode } from "../Pattern";
import { Handle, Node, Position, useUpdateNodeInternals } from "@xyflow/react";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { FaRandom } from "react-icons/fa";
import { nanoid } from "nanoid";
import { Button } from "@chakra-ui/react";

type DataNode = {
  exits: { key: string }[];
  preview: string[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNode, delEdge } = useStore((s) => ({
    updateNode: s.updateNode,
    delEdge: s.delEdge,
  }));

  return (
    <div className="flex flex-col -mt-3">
      <div className="my-1 flex flex-col gap-2">
        <ul className="gap-2 grid grid-cols-2">
          {data.exits?.map((item, index) => (
            <li
              key={item.key}
              className="flex gap-1 justify-between rounded-md items-center w-full bg-slate-300/5 p-2 pr-1.5"
            >
              <div className="flex gap-x-1 items-center">
                <span className="tracking-wide text-white/40">Saída</span>
                <span className="font-semibold text-base">{index + 1}</span>
              </div>
              <a
                className=""
                onClick={() => {
                  delEdge(item.key);
                  const nextItems = data.exits.filter(
                    (i) => i.key !== item.key
                  );
                  const nextPreview = data.preview.filter(
                    (key: string) => key !== item.key
                  );
                  updateNode(id, {
                    data: {
                      ...data,
                      exits: nextItems,
                      preview: nextPreview,
                    },
                  });
                  updateNodeInternals(id);
                }}
              >
                <IoIosCloseCircle
                  size={24}
                  className="text-red-500/40 hover:text-red-500/80 duration-200 cursor-pointer"
                />
              </a>
            </li>
          ))}
        </ul>
        {data.exits.length < 30 && (
          <Button
            onClick={() => {
              const itemId = nanoid();

              const exits = data?.exits?.length
                ? [...data.exits, { key: itemId, value: "" }]
                : [{ key: itemId, value: "" }];

              const pp = data.preview.length
                ? [...data.preview, itemId]
                : [itemId];
              updateNode(id, {
                data: { ...data, exits, preview: pp },
              });
              updateNodeInternals(id);
            }}
            variant={"plain"}
            colorPalette={"green"}
            size={"xs"}
          >
            <span>
              Adicionar saída{" "}
              {data.exits.length > 24 ? `${data.exits.length}/30` : ""}
            </span>
            <IoMdAdd size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}

export const NodeDistribute: React.FC<
  Node<DataNode & { preview: string[] }>
> = (props) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node Distribuidor"
        description="Distribui aleatoriamente"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        node={{
          children: (
            <div
              style={{
                height:
                  props.data.preview?.length >= 4
                    ? 14 * props.data.preview.length + 20 - 35
                    : 35,
              }}
              className="p-1.5 relative flex items-center"
            >
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={props.id} />
              </div>
              <FaRandom
                className="dark:text-purple-400 text-purple-700"
                size={24}
              />
            </div>
          ),
          name: "Aleatório",
          description: "Distribuir",
        }}
      >
        <BodyNode data={props.data} id={props.id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      {props.data.preview?.map((id: string, index: number) => (
        <CustomHandle
          nodeId={props.id}
          isConnectable
          handleId={id}
          key={id}
          type="source"
          position={Position.Right}
          style={{ right: -24, top: 14 * index + 6 }}
          className="relative"
        >
          <span
            style={{ fontSize: 9, top: -3, left: -19 }}
            className="absolute cursor-default text-white/50 -left-[13px] font-medium"
          >
            {`[${index + 1}]`}
          </span>
        </CustomHandle>
      ))}
    </div>
  );
};
