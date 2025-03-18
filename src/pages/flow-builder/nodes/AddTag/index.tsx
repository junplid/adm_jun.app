import { useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { TbTags } from "react-icons/tb";
import useStore from "../../flowStore";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";

const suggestions = ["Teste 1", "Teste 2"].map((country) => {
  return {
    id: country,
    text: country,
    className: "",
  };
});

type DataNode = {
  list: number[];
};

export const NodeAddTags: React.FC<Node<DataNode>> = ({ data, id }) => {
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
        title="Node adicionar etiquetas"
        description="Adiciona várias etiquetas/tags ao lead"
        node={{
          children: (
            <div className="p-1">
              <TbTags
                className="dark:text-green-300 text-green-800"
                size={26.8}
              />
            </div>
          ),
          name: "Etiquetas",
          description: "Adiciona",
        }}
      >
        <div className="flex flex-col gap-y-5 -mt-3 ">
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
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
