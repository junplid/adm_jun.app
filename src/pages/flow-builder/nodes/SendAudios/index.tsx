import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { useDBNodes } from "../../../../db";
import useStore from "../../flowStore";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import { Button } from "@chakra-ui/react";
import { GrClose } from "react-icons/gr";
import { TbHeadphones } from "react-icons/tb";
import AudioPlayerWA from "@components/AudioPlayerWA";
import { CustomHandle } from "../../customs/node";

type DataNode = {
  files: { id: number; fileName: string | null; originalName: string }[];
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const updateNode = useStore((s) => s.updateNode);
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  if (!node) {
    return <span>Não encontrado</span>;
  }

  const { data } = node;

  return (
    <div>
      <div className="-mt-2 flex flex-col gap-2">
        {data.files?.length ? (
          <div className="flex flex-col gap-1.5">
            {data.files.map((item) => (
              <div key={item.id} className="flex flex-col items-end gap-y-0.5">
                <div className="flex w-full items-center gap-x-1">
                  <button
                    className="hover:bg-white/5 duration-200 rounded-sm p-1.5 cursor-pointer"
                    type="button"
                    onClick={() => {
                      updateNode(id, {
                        data: {
                          ...data,
                          files: data.files.filter((_) => _.id !== item.id),
                        },
                      });
                    }}
                  >
                    <GrClose size={15} color="#d36060" />
                  </button>
                  <AudioPlayerWA src="/audios/meu-voz.ogg" />
                </div>
                <span className="text-xs text-white/60">
                  {item.originalName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-center text-white/60">
            *Nenhum áudio selecionado
          </span>
        )}

        <ModalStorageFiles
          onSelected={(files) => {
            updateNode(id, {
              data: {
                ...data,
                files,
              },
            });
          }}
          mimetype="audio/"
        >
          <Button size={"sm"}>Selecionar os áudios</Button>
        </ModalStorageFiles>
      </div>
    </div>
  );
}

export const NodeSendAudios: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar áudios"
        description="Usado para enviar mídias de áudios"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100">
                <PatternNode.Actions id={id} />
              </div>
              <TbHeadphones
                className="dark:text-[#daa557] text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Áudios",
          description: "Envia",
        }}
      >
        <BodyNode id={id} />
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
