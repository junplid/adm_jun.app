import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import { Button } from "@chakra-ui/react";
import { GrClose } from "react-icons/gr";
import AudioSpeekPlayerWA from "@components/AudioSpeekPlayerWA";
import { VscMic } from "react-icons/vsc";
import { CustomHandle } from "../../customs/node";
import { api } from "../../../../services/api";

type DataNode = {
  files: { id: number; fileName: string | null; originalName: string }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);

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
                  <AudioSpeekPlayerWA
                    src={api.getUri() + "/public/storage/" + item.fileName}
                  />
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
          mimetype={["audio/"]}
        >
          <Button size={"sm"}>Selecionar os áudios</Button>
        </ModalStorageFiles>
      </div>
    </div>
  );
}

export const NodeSendAudiosLive: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar áudios"
        description="Usado para enviar áudios como se fossem gravados na hora"
        size="300px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100">
                <PatternNode.Actions id={id} />
              </div>
              <VscMic className="dark:text-[#0dacd4] text-teal-700" size={31} />
            </div>
          ),
          name: "Áudios",
          description: "Envia",
        }}
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
