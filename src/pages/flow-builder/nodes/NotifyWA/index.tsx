import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import AutocompleteTextField from "@components/Autocomplete";
import { Input, InputGroup } from "@chakra-ui/react";
import { withMask } from "use-mask-input";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { nanoid } from "nanoid";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import SelectTags from "@components/SelectTags";
import { Field } from "@components/ui/field";

type DataNode = {
  numbers: { key: string; number: string }[];
  text: string;
  tagIds: number[];
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

  const handleDelete = (index: number) => {
    if (!index && data.numbers.length === 1) {
      updateNode(id, {
        data: { ...data, numbers: data.numbers.filter((_, i) => i !== index) },
      });
    } else {
      updateNode(id, {
        data: { ...data, numbers: data.numbers.filter((_, i) => i !== index) },
      });
    }
  };

  const handleAddition = async (number: string) => {
    const exist = data.numbers.find((s) => s.number === number);
    if (exist) return;
    updateNode(id, {
      data: { ...data, numbers: [...data.numbers, { key: nanoid(), number }] },
    });
  };

  return (
    <div className="flex flex-col gap-y-2 -mt-2">
      {!data.numbers.length ? (
        <span className="text-white/70">*Nenhum Whatsapp selecionado</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {data.numbers.map((item, index) => (
            <div key={item.key} className="flex items-center gap-x-0.5">
              <button
                className="hover:bg-white/5 duration-200 rounded-sm p-1.5 cursor-pointer"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <GrClose size={15} color="#d36060" />
              </button>
              <span className="text-xs">{item.number}</span>
            </div>
          ))}
        </div>
      )}
      <InputGroup startElement="+55">
        <Input
          ref={withMask(["(99) 9999-9999", "(99) 99999-9999"])}
          autoComplete="nope"
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddition(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </InputGroup>
      <span className="text-xs text-white/50">
        <strong>!</strong> Números inválidos ou sem WhatsApp serão descartados
        automaticamente.
      </span>

      <p className="text-center -mb-1 mt-1">Mensagem</p>
      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables?.map((s) => s.name) || [] }}
        spacer={"}} "}
        type="textarea"
        placeholder="Insira a mensagem que será enviada aos números informados"
        defaultValue={data.text || ""}
        onChange={(target: string) => setDataMok({ ...data, text: target })}
      />

      <Field
        label="Selecione etiquetas"
        helperText="Selecione as etiquetas que deseja adicionar aos contatos notificados"
        className="mt-2"
      >
        <SelectTags
          isMulti={true}
          isClearable
          menuPlacement="bottom"
          isFlow
          value={data.tagIds}
          onChange={(e: any) => {
            data.tagIds = e.map((item: any) => item.value);
            updateNode(id, { data: { ...data, tagIds: data.tagIds } });
          }}
          onCreate={(tag) => {
            data.tagIds.push(tag.id);
            updateNode(id, { data: { ...data, tagIds: data.tagIds } });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeNotifyWA: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de notificar WhatsApp"
        description="Envia notificações há vários WhatsApp"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <MdOutlineNotificationsActive
                className="dark:text-green-500 text-green-600"
                size={28}
              />
            </div>
          ),
          name: "WhatsApp",
          description: "Notifica",
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
