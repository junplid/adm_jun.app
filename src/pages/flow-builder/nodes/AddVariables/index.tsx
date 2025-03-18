import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import useStore from "../../flowStore";
import { useEffect, useState } from "react";
import { Input } from "@chakra-ui/react";

const suggestions = ["Teste 1", "Teste 2"].map((country) => {
  return {
    id: country,
    text: country,
    className: "",
  };
});
type DataNode = {
  list: {
    id: number;
    value: string;
  }[];
};

export const NodeAddVariables: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);

  const [tags, setTags] = useState<Array<Tag>>([]);
  const [focus, setFocus] = useState(false);

  const handleDelete = (index: number) => {
    if (!index && tags.length === 1) {
      setTags(tags.filter((_, i) => i !== index));
    } else {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const handleAddition = (tag: Tag) => {
    setTags((prevTags) => {
      return [
        ...prevTags,
        { ...tag, text: tag.text.trim().replace(/\s/g, "_") },
      ];
    });
  };

  useEffect(() => {
    if (!data.list?.length) {
      updateNode(id, { data: { list: [] } });
    }
  }, [id]);

  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de variáveis"
        description="Adiciona várias variáveis ao lead"
        node={{
          children: (
            <div className="p-1">
              <PiBracketsCurlyBold
                className="dark:text-green-300 text-green-800"
                size={26.8}
              />
            </div>
          ),
          name: "Variáveis",
          description: "Atribuir",
        }}
      >
        <div className="flex flex-col gap-y-3 -mt-3 ">
          <ReactTags
            tags={tags}
            suggestions={suggestions}
            separators={[SEPARATORS.ENTER]}
            handleAddition={handleAddition}
            handleDelete={handleDelete}
            placeholder="Digite e pressione `ENTER`"
            allowDragDrop={false}
            handleInputFocus={() => setFocus(true)}
            handleInputBlur={() => setFocus(false)}
            handleTagClick={handleDelete}
            classNames={{
              selected: `flex flex-wrap border p-2 rounded-sm gap-1.5 gap-y-2 w-full ${focus ? "border-white" : "border-white/10"}`,
              tagInputField:
                "!border-none bg-[#ffffff05] focus:bg-[#ffffff10] outline-none p-1 px-2 w-full",
              remove: "hidden",
              tag: "hover:bg-red-500 duration-300 !cursor-pointer bg-white/15 px-1",
              tagInput: "w-full",
            }}
          />

          {!tags.length && (
            <span className="text-white/70">*Nenhuma variável selecionada</span>
          )}
          {!!tags.length && (
            <div className="flex flex-col gap-y-1.5 mt-1">
              {tags.map(({ id, text }) => (
                <div className="flex items-center gap-x-2">
                  <span key={id}>{`{{${text}}}`}:</span>
                  <Input placeholder="Valor" size={"xs"} fontSize={14} />
                </div>
              ))}
            </div>
          )}
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
