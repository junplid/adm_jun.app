import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import useStore from "../../flowStore";
import { JSX, useMemo } from "react";
import { Highlight } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";
import { useDBNodes, useVariables } from "../../../../db";
import { GrClose } from "react-icons/gr";

type DataNode = {
  list: number[];
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const colorQuery = useColorModeValue("#000000", "#ffffff");
  const variables = useVariables();

  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  const suggestions = useMemo(() => {
    return variables
      .filter(
        (s) => s.type === "dynamics" && !node?.data.list.some((v) => v === s.id)
      )
      .map((s) => ({
        id: String(s.id),
        text: s.name,
        className: "",
      }));
  }, [variables, node?.data.list]);

  if (!node) return <span>Não encontrado</span>;

  const handleDelete = (index: number) => {
    if (!index && node.data.list.length === 1) {
      updateNode(id, {
        data: { list: node.data.list.filter((_, i) => i !== index) },
      });
    } else {
      updateNode(id, {
        data: { list: node.data.list.filter((_, i) => i !== index) },
      });
    }
  };

  const handleAddition = async (tag: Tag) => {
    const nextName = tag.text.trim().replace(/\s/g, "_");
    const exist = variables.find((s) => s.name === nextName);
    if (!exist) return;
    updateNode(id, { data: { list: [...node.data.list, Number(tag.id)] } });
  };

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      {!node.data.list.length ? (
        <span className="text-white/70">*Nenhuma variável selecionada</span>
      ) : (
        <div className="flex flex-col gap-y-1.5 mt-1">
          {node.data.list.map((idItem, index) => (
            <div key={idItem} className="flex items-center gap-x-1">
              <button
                className="hover:bg-white/5 duration-200 rounded-sm p-1.5 cursor-pointer"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <GrClose size={15} color="#d36060" />
              </button>
              <span>
                {`{{${variables.find((s) => s.id === idItem)?.name || "..."}}}`}
              </span>
            </div>
          ))}
        </div>
      )}
      <ReactTags
        tags={[]}
        suggestions={suggestions}
        separators={[SEPARATORS.ENTER]}
        handleAddition={handleAddition}
        placeholder="Digite e pressione `ENTER`"
        allowDragDrop={false}
        shouldRenderSuggestions={(query) => {
          return query.length > 0;
        }}
        handleFilterSuggestions={(query, suggestions) => {
          return suggestions
            .filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3);
        }}
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
          tags: "w-full relative",
          suggestions:
            "absolute z-50 dark:bg-[#111111] bg-white w-full translate-y-2 shadow-xl p-1 border dark:border-white/10 border-black/10 rounded-sm",
        }}
      />
      <div className="mt-24"></div>
    </div>
  );
}

export const NodeRemoveVariables: React.FC<Node<DataNode>> = ({ id }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de variáveis"
        description="Remove várias variáveis do lead"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <PiBracketsCurlyBold
                className="dark:text-red-300 text-red-800"
                size={26.8}
              />
            </div>
          ),
          name: "Variáveis",
          description: "Remover",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
