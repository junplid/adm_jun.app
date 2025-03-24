import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { TbTags } from "react-icons/tb";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import useStore from "../../flowStore";
import { useEffect, useState } from "react";
import { Highlight } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

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

export const NodeRemoveTags: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);

  const [tags, setTags] = useState<Array<Tag>>([]);
  const colorQuery = useColorModeValue("#000000", "#ffffff");

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
        title="Node de remover etiquetas"
        description="Remova várias etiquetas/tags do lead"
        node={{
          children: (
            <div className="p-1">
              <TbTags className="dark:text-red-300 text-red-800" size={26.8} />
            </div>
          ),
          name: "Etiquetas",
          description: "Remove",
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
            handleTagClick={handleDelete}
            renderSuggestion={(item, query) => (
              <div
                key={item.id}
                className="p-2 dark:text-white/50 text-black/40 py-1.5 cursor-pointer"
                style={{ borderRadius: 20 }}
              >
                <Highlight
                  styles={{
                    // px: "0.5",
                    // bg: "#ea5c0a",
                    color: colorQuery,
                    fontWeight: 600,
                  }}
                  query={query}
                >
                  {item.text}
                </Highlight>
              </div>
            )}
            classNames={{
              selected: `flex flex-wrap border gap-1.5 gap-y-2 w-full border-none`,
              tagInputField: `p-2.5 rounded-sm w-full border dark:border-white/10 border-black/10`,
              remove: "hidden",
              tag: "hover:bg-red-500 duration-300 !cursor-pointer dark:bg-white/15 bg-black/15 px-1",
              tagInput: "w-full",
              suggestions:
                "absolute z-50 dark:bg-[#111111] bg-white w-full translate-y-2 shadow-xl p-1 border dark:border-white/10 border-black/10 rounded-sm",
            }}
          />
        </div>
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
