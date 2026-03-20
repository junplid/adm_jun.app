import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import { GrClose } from "react-icons/gr";
import { IoMdImage } from "react-icons/io";
import {
  PiFile,
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import AutocompleteTextField from "@components/Autocomplete";
import { Button } from "@chakra-ui/react";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  files: { id: number; originalName: string; mimetype: string | null }[];
  caption?: string;
};

const IconPreviewFile = (p: { mimetype: string }): JSX.Element => {
  if (/^image\//.test(p.mimetype)) {
    return <IoMdImage color="#6daebe" size={20} />;
  }
  if (/^video\//.test(p.mimetype)) {
    return <PiFileVideoFill color="#8eb87a" size={20} />;
  }
  if (/^audio\//.test(p.mimetype)) {
    return <PiFileAudioFill color="#d4b663" size={20} />;
  }
  if (p.mimetype === "application/pdf") {
    return <PiFilePdfFill color="#db8c8c" size={20} />;
  }
  if (/^text\//.test(p.mimetype)) {
    return <PiFileTextFill color="#ffffff" size={20} />;
  }
  return <PiFileFill color="#808080" size={20} />;
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
      <div className="-mt-2 flex flex-col gap-2">
        {data.files?.length ? (
          <div className="flex flex-col gap-1.5">
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
                <IconPreviewFile mimetype={item.mimetype || ""} />
                <span className="text-xs">{item.originalName}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-center text-white/60">
            *Nenhum documento selecionado.
          </span>
        )}
        <ModalStorageFiles
          onSelected={(files) => {
            updateNode(id, { data: { ...data, files } });
          }}
        >
          <Button size={"sm"}>Selecionar os documentos</Button>
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

export const NodeSendFiles: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar documentos"
        description="Usado para enviar vários documentos"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <PiFile className="text-[#999999]" size={31} />
            </div>
          ),
          name: "Documentos",
          description: "Envia",
        }}
      >
        <BodyNode data={data} id={id} />
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
