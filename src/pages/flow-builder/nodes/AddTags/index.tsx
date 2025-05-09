import { JSX, useEffect, useMemo } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { TbTags } from "react-icons/tb";
import useStore from "../../flowStore";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import { Highlight, Presence, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";
import { db, useDBNodes, useTags } from "../../../../db";
import { useCreateTag } from "../../../../hooks/tag";

type DataNode = {
  list: number[];
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const colorQuery = useColorModeValue("#000000", "#ffffff");
  const tags = useTags();

  const { updateNode, businessIds } = useStore((s) => ({
    updateNode: s.updateNode,
    businessIds: s.businessIds,
  }));
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;

  const { mutateAsync: createTag, status } = useCreateTag({});

  const suggestions = useMemo(() => {
    return tags
      .filter(
        (s) =>
          s.type === "contactwa" && !node?.data.list.some((v) => v === s.id)
      )
      .map((s) => ({
        id: String(s.id),
        text: s.name,
        className: "",
      }));
  }, [tags, node?.data.list]);

  const selecteds = useMemo(() => {
    return node?.data.list
      ?.map((id) => {
        const exist = tags.find((v) => v.id === id);
        if (!exist) return null;
        return { id: String(id), text: exist?.name, className: "" };
      })
      .filter((s) => s !== null);
  }, [node?.data.list, tags]);

  if (!node) {
    return <span>Não encontrado</span>;
  }

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
    const exist = tags.find((s) => s.name === nextName);

    if (!exist) {
      const vv = await db.tags.add({ name: nextName, type: "contactwa" });
      const tag = await createTag({
        targetId: vv,
        name: nextName,
        businessIds,
        type: "contactwa",
      });
      await db.tags.update(vv, { id: tag.id });
      updateNode(id, { data: { list: [...node.data.list, Number(tag.id)] } });
      return;
    }

    updateNode(id, {
      data: {
        list: [...node.data.list, Number(tag.id)],
      },
    });
    updateNode(id, { data: { list: [...node.data.list] } });
  };

  return (
    <div className="flex flex-col gap-y-5 -mt-3 ">
      <Presence
        animationName={{
          _open: "slide-from-top, fade-in",
          _closed: "slide-to-top, fade-out",
        }}
        animationDuration="moderate"
        present={status === "pending"}
        top={0}
        left={0}
        zIndex={99999}
        className="bg-white/5 flex items-center justify-center rounded-sm"
      >
        <Spinner size={"sm"} />
      </Presence>
      <ReactTags
        tags={selecteds}
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
  );
}

export const NodeAddTags: React.FC<Node<DataNode>> = ({ data, id }) => {
  const updateNode = useStore((s) => s.updateNode);

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
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      <Handle type="source" position={Position.Right} style={{ right: -8 }} />
    </div>
  );
};
