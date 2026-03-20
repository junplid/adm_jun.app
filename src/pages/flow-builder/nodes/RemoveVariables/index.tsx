import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import useStore from "../../flowStore";
import { JSX, useMemo } from "react";
import { Highlight } from "@chakra-ui/react";
import { GrClose } from "react-icons/gr";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  list: number[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));
  const { data: variables } = useGetVariablesOptions();

  const suggestions = useMemo(() => {
    return (variables || [])
      ?.filter(
        (s) => s.type === "dynamics" && !data.list.some((v) => v === s.id),
      )
      .map((s) => ({
        id: String(s.id),
        text: s.name,
        className: "",
      }));
  }, [variables, data.list]);

  const handleDelete = (index: number) => {
    if (!index && data.list.length === 1) {
      updateNode(id, {
        data: { list: data.list.filter((_, i) => i !== index) },
      });
    } else {
      updateNode(id, {
        data: { list: data.list.filter((_, i) => i !== index) },
      });
    }
  };

  const handleAddition = async (tag: Tag) => {
    const nextName = tag.text.trim().replace(/\s/g, "_");
    const exist = (variables || []).find((s) => s.name === nextName);
    if (!exist) return;
    updateNode(id, { data: { list: [...data.list, Number(tag.id)] } });
  };

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      {!data.list.length ? (
        <span className="text-white/70">*Nenhuma variável selecionada.</span>
      ) : (
        <div className="flex flex-col gap-y-1.5 mt-1">
          {data.list.map((idItem, index) => (
            <div key={idItem} className="flex items-center gap-x-1">
              <button
                className="hover:bg-white/5 duration-200 rounded-sm p-1.5 cursor-pointer"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <GrClose size={15} color="#d36060" />
              </button>
              <span>
                {`{{${(variables || []).find((s) => s.id === idItem)?.name || "..."}}}`}
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
            className="p-2 text-white/50 py-1.5 cursor-pointer"
            style={{ borderRadius: 20 }}
          >
            <Highlight
              styles={{
                // px: "0.5",
                // bg: "#ea5c0a",
                color: "#ffffff",
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
          tagInputField: `p-2.5 rounded-sm w-full border border-white/10`,
          remove: "hidden",
          tag: "bg-red-500 duration-300 !cursor-pointer bg-white/15 px-1",
          tagInput: "w-full",
          tags: "w-full relative",
          suggestions:
            "absolute z-50 bg-[#111111] w-full translate-y-2 shadow-xl p-1 border border-white/10 rounded-sm",
        }}
      />
      <div className="mt-24"></div>
    </div>
  );
}

export const NodeRemoveVariables: React.FC<Node<DataNode>> = ({ id, data }) => {
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
              <PiBracketsCurlyBold className="text-red-300" size={26.8} />
            </div>
          ),
          name: "Variáveis",
          description: "Remover",
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
