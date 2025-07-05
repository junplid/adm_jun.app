import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import AutocompleteTextField from "@components/Autocomplete";
import { Button } from "@chakra-ui/react";
import { GrClose } from "react-icons/gr";
import { PiFileVideoFill } from "react-icons/pi";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  files: { id: number; originalName: string | null }[];
  caption?: string;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);
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
    <div>
      <div className="-mt-4 flex flex-col gap-2 p-2">
        {data.files?.length ? (
          <div className="grid grid-cols-2 gap-1.5">
            {data.files.map((item) => (
              <div key={item.id} className="flex items-center gap-x-0.5">
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
                <PiFileVideoFill color="#8eb87a" size={20} />
                <span className="text-xs">{item.originalName}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-center text-white/60">
            *Nenhum video selecionado
          </span>
        )}
        <ModalStorageFiles
          onSelected={(files) => {
            updateNode(id, {
              data: {
                ...data,
                files: files.map(({ fileName, ...rest }) => rest),
              },
            });
          }}
          mimetype={["video/"]}
        >
          <Button size={"sm"}>Selecionar os vídeo</Button>
        </ModalStorageFiles>

        <div />
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}} "}
          type="textarea"
          placeholder="Adicione uma legenda..."
          defaultValue={data.caption || ""}
          onChange={(target: string) => {
            setDataMok({ ...data, caption: target });
          }}
        />
      </div>
    </div>
  );
}

export const NodeSendVideos: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar vídeos"
        description="Usado para enviar vários vídeos"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100">
                <PatternNode.Actions id={id} />
              </div>
              <PiFileVideoFill
                className="dark:text-[#8eb87a] text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Vídeos",
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
