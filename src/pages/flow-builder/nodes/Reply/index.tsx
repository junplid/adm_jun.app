import {
  Button,
  createListCollection,
  Highlight,
  NumberInput,
  Select,
  Span,
  Stack,
} from "@chakra-ui/react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { BsChatLeftDots } from "react-icons/bs";
import { RxLapTimer } from "react-icons/rx";

import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import { JSX, useEffect, useMemo, useState } from "react";
import useStore from "../../flowStore";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@components/ui/select";
import { createVariable } from "../../../../services/api/Variable";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  isSave?: boolean;
  list: number[];
  timeout?: {
    type?: ("SECONDS" | "MINUTES" | "HOURS" | "DAYS")[];
    value: number;
  };
};

const timesList = createListCollection({
  items: [
    {
      label: "Seg",
      value: "SECONDS",
      description: "Segundos",
    },
    {
      label: "Min",
      value: "MINUTES",
      description: "Minutos",
    },
    {
      label: "Hor",
      value: "HOURS",
      description: "Horas",
    },
    {
      label: "Dia",
      value: "DAYS",
      description: "Dias",
    },
  ],
});

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode, businessIds } = useStore((s) => ({
    updateNode: s.updateNode,
    businessIds: s.businessIds,
  }));
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

  const suggestions = useMemo(() => {
    return (variables || [])
      .filter(
        (s) => s.type === "dynamics" && !data.list?.some((v) => v === s.id),
      )
      .map((s) => ({
        id: String(s.id),
        text: s.name,
        className: "",
      }));
  }, [variables, data.list]);

  const selecteds = useMemo(() => {
    return data.list
      ?.map((id) => {
        const exist = (variables || []).find((v) => v.id === id);
        if (!exist) return null;
        return { id: String(id), text: exist?.name, className: "" };
      })
      .filter((s) => s !== null);
  }, [data.list, variables]);

  const handleAddition = async (tag: Tag) => {
    const nextName = tag.text.trim().replace(/\s/g, "_");
    const exist = (variables || []).find((s) => s.name === nextName);

    if (!exist) {
      const variable = await createVariable({
        name: nextName,
        businessIds,
        type: "dynamics",
      });
      updateNode(id, { data: { ...data, list: [...data.list, variable.id] } });
      return;
    }

    updateNode(id, { data: { ...data, list: [...data.list, Number(tag.id)] } });
  };

  const handleDelete = (index: number) => {
    if (!index && data.list.length === 1) {
      updateNode(id, {
        data: { ...data, list: data.list.filter((_, i) => i !== index) },
      });
    } else {
      updateNode(id, {
        data: { ...data, list: data.list.filter((_, i) => i !== index) },
      });
    }
  };

  return (
    <div className="flex flex-col relative -mt-3 gap-y-5">
      {!!data.isSave && (
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
            tag: "hover:bg-red-500 rounded-xs duration-300 !cursor-pointer bg-white/15 px-1",
            tagInput: "w-full",
            tags: "w-full relative",
            suggestions:
              "absolute z-50 bg-[#111111] w-full translate-y-2 shadow-xl p-1 border border-white/10 rounded-sm",
          }}
        />
      )}

      <Button
        onClick={() =>
          updateNode(id, { data: { ...data, isSave: !data.isSave } })
        }
        size={"sm"}
        colorPalette={data.isSave ? "red" : "green"}
      >
        {data.isSave ? "Não salvar " : "Salvar "}a resposta
      </Button>

      <div className="grid grid-cols-[1fr_43px_75px] gap-x-1 w-full justify-between">
        <div className="flex flex-col">
          <span className="font-medium">Tempo esperando</span>
          <span className="text-white/70 font-light">Resposta do lead</span>
        </div>
        <NumberInput.Root
          min={0}
          max={60}
          size={"md"}
          value={data.timeout?.value ? String(data.timeout.value) : "0"}
          defaultValue="0"
        >
          <NumberInput.Input
            style={{
              borderColor: data.timeout?.value ? "transparent" : "",
            }}
            maxW={"43px"}
            onChange={({ target }) => {
              setDataMok({
                ...data,
                timeout: {
                  ...data.timeout,
                  value: Number(target.value),
                },
              });
            }}
          />
        </NumberInput.Root>
        <SelectRoot
          value={data.timeout?.type}
          onValueChange={(e) => {
            updateNode(id, {
              data: {
                ...data,
                timeout: { ...data.timeout, type: e.value },
              },
            });
          }}
          collection={timesList}
        >
          <SelectTrigger>
            <SelectValueText placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {timesList.items.map((time) => (
              <SelectItem item={time} key={time.value}>
                <Stack gap="0">
                  <Select.ItemText>{time.label}</Select.ItemText>
                  <Span color="fg.muted" textStyle="xs">
                    {time.description}
                  </Span>
                </Stack>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>
    </div>
  );
}

export const NodeReply: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de resposta"
        description="Salve a resposta em várias variáveis"
        node={{
          children: (
            <div className="p-[6.5px] relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <BsChatLeftDots className="text-blue-400" size={22} />
            </div>
          ),
          name: "Resposta",
          description: "Receber",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />

      <CustomHandle
        nodeId={id}
        handleId={"main"}
        position={Position.Right}
        type="source"
        style={{ right: -8, top: 12 }}
        isConnectable={true}
      />
      <span className="absolute -right-3.25 top-7.75 text-red-400">
        <RxLapTimer size={11} />
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`#B1474A timeout`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 37 }}
        isConnectable={true}
        className="border-red-400/60! bg-red-400/15!"
      />
    </div>
  );
};
