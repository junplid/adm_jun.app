import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import useStore from "../../flowStore";
import { JSX, useEffect, useMemo, useState } from "react";
import { Highlight, Presence, Spinner } from "@chakra-ui/react";
import {
  useCreateVariable,
  useGetVariablesOptions,
} from "../../../../hooks/variable";
import { GrClose } from "react-icons/gr";
import { useColorModeValue } from "@components/ui/color-mode";
import { CustomHandle } from "../../customs/node";
import AutocompleteTextField from "@components/Autocomplete";

type DataNode = {
  list: {
    id: number;
    value: string;
  }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const colorQuery = useColorModeValue("#000000", "#ffffff");
  const { updateNode, businessIds } = useStore((s) => ({
    updateNode: s.updateNode,
    businessIds: s.businessIds,
  }));
  const { data: variables } = useGetVariablesOptions();
  const { mutateAsync: createVariable, status } = useCreateVariable();

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

  const suggestions = useMemo(() => {
    return variables
      ?.filter(
        (s) => s.type === "dynamics" && !data.list.some((v) => v.id === s.id)
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
    const exist = variables?.find((s) => s.name === nextName);

    if (!exist) {
      const variable = await createVariable({
        name: nextName,
        businessIds,
        type: "dynamics",
      });
      updateNode(id, {
        data: { list: [...data.list, { id: variable.id, value: "" }] },
      });
    } else {
      updateNode(id, {
        data: { list: [...data.list, { id: Number(exist.id), value: "" }] },
      });
    }
  };

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      {!data.list.length ? (
        <span className="text-white/70">*Nenhuma variável selecionada</span>
      ) : (
        <div className="flex flex-col gap-y-1.5 mt-1">
          {data.list.map(({ id: idItem, value }, index) => (
            <div key={idItem} className="flex gap-x-1">
              <button
                className="hover:bg-white/5 duration-200 rounded-sm p-1.5 cursor-pointer"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <GrClose size={15} color="#d36060" />
              </button>
              <div className="flex flex-col gap-1.5 w-full">
                <span>
                  {`{{${variables?.find((s) => s.id === idItem)?.name || "..."}}}`}
                  :
                </span>
                <AutocompleteTextField
                  // @ts-expect-error
                  trigger={["{{"]}
                  options={{ "{{": variables?.map((s) => s.name) || [] }}
                  spacer={"}} "}
                  type="textarea"
                  placeholder="Valor"
                  defaultValue={value}
                  // @ts-expect-error
                  onChange={(value) => {
                    data.list[index].value = value;
                    setDataMok({ list: data.list });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex w-full items-center gap-x-2">
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
      </div>
      <div className="mt-24"></div>
    </div>
  );
}

export const NodeAddVariables: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de variáveis"
        description="Adiciona várias variáveis ao lead"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
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
