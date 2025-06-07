import { JSX } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { useDBNodes, useVariables } from "../../../../db";
import useStore from "../../flowStore";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import { IoIosCloseCircle } from "react-icons/io";
import AutocompleteTextField from "@components/Autocomplete";
import { Button, Image } from "@chakra-ui/react";
import { api } from "../../../../services/api";
import { MdOutlineImage } from "react-icons/md";

type DataNode = {
  files: { id: number; fileName: string | null }[];
  caption?: string;
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const variables = useVariables();
  const updateNode = useStore((s) => s.updateNode);
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  if (!node) {
    return <span>Não encontrado</span>;
  }

  const { data } = node;

  return (
    <div>
      <div className="-mt-4 flex flex-col gap-2 p-2">
        {data.files?.length ? (
          <div className="grid grid-cols-2 gap-1.5">
            {data.files.map((item) => (
              <div
                key={item.id}
                className="flex flex-col group items-center border border-zinc-700 gap-x-0.5 relative"
              >
                <a
                  className="absolute -top-0 -left-0 w-full h-full bg-red-200/50 backdrop-blur-[2px] duration-500 flex items-center group-hover:opacity-100 opacity-0 cursor-pointer"
                  onClick={() => {
                    updateNode(id, {
                      data: {
                        ...data,
                        files: data.files.filter((_) => _.id !== item.id),
                      },
                    });
                  }}
                >
                  <IoIosCloseCircle
                    size={32}
                    className="text-red-600/80 group-hover:opacity-100 duration-300 opacity-0 w-full"
                  />
                </a>
                <Image
                  aspectRatio={1 / 1}
                  w="100%"
                  h="auto"
                  src={api.getUri() + "/public/storage/" + item.fileName}
                  fetchPriority="low"
                />
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-center text-white/60">
            *Nenhuma imagem selecionada
          </span>
        )}
        <ModalStorageFiles
          onSelected={(files) => {
            updateNode(id, {
              data: {
                ...data,
                files: files.map(({ originalName, ...rest }) => rest),
              },
            });
          }}
          mimetype="image/"
        >
          <Button size={"sm"}>Selecionar as imagens</Button>
        </ModalStorageFiles>

        <div />
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables.map((s) => s.name) }}
          spacer={"}} "}
          type="textarea"
          placeholder="Adicione uma legenda..."
          defaultValue={data.caption || ""}
          // @ts-expect-error
          onBlur={({ target }) => {
            updateNode(id, { data: { ...data, caption: target.value } });
          }}
        />
      </div>
    </div>
  );
}

export const NodeSendImages: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar imagens"
        description="Usado para enviar várias imagens"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100">
                <PatternNode.Actions id={id} />
              </div>
              <MdOutlineImage
                className="dark:text-[#6daebe] text-teal-700"
                size={31}
              />
            </div>
          ),
          name: "Imagens",
          description: "Envia",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
