import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { FaRoute } from "react-icons/fa";
import { NumberInput } from "@chakra-ui/react";
import { MdHourglassEmpty } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";

type DataNode = {
  nOrder: string;
  max?: string;
  minutes?: number;
  varId_save_nRouter?: number;
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

  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      <Field label="Código do pedido">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite o código do pedido"
          defaultValue={data.nOrder || ""}
          onChange={(value: string) => setDataMok({ ...data, nOrder: value })}
        />
      </Field>

      <Field label="Máximo de pedidos">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          placeholder="Digite um número ou {{MAX_ITEMS_ROUTER}}"
          defaultValue={data.max || ""}
          onChange={(value: string) => setDataMok({ ...data, max: value })}
        />
      </Field>

      <Field label="Salvar o código da rota">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          isFlow
          menuPlacement="bottom"
          filter={(opt) => opt.filter((s) => s.type === "dynamics")}
          onCreate={(tag) => {
            updateNode(id, { data: { ...data, varId_save_nRouter: tag.id } });
          }}
          value={data.varId_save_nRouter}
          onChange={(e: any) => {
            updateNode(id, { data: { ...data, varId_save_nRouter: e.value } });
          }}
        />
      </Field>

      <div className="grid grid-cols-[1fr_50px] gap-x-1 w-full justify-between">
        <div className="flex flex-col">
          <span className="font-medium">Minutos para fechar rota</span>
          <span className="text-white/70 font-light">e seguir o fluxo</span>
        </div>
        <NumberInput.Root
          min={0}
          size={"md"}
          value={data?.minutes ? String(data.minutes) : "8"}
          defaultValue="8"
        >
          <NumberInput.Input
            style={{ borderColor: data.minutes ? "transparent" : "" }}
            maxW={"80px"}
            onChange={({ target }) => {
              setDataMok({ ...data, minutes: Number(target.value) });
            }}
          />
        </NumberInput.Root>
      </div>
    </div>
  );
}

export const NodeAppendRouter: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de acrescentar rota"
        description="Acrescentar novo local a rota existente ou criar uma rota com o local"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-1.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <FaRoute className="text-green-400" size={23} />
            </div>
          ),
          name: "Rota",
          description: "Append",
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
      <CustomHandle
        nodeId={id}
        handleId={`#f59f0bdf max`}
        position={Position.Right}
        type="source"
        style={{ right: -28, top: 44 }}
        isConnectable={true}
        className="border-[#f59f0bdf]! bg-[#f59f0bdf]/15!"
      />
      <span className="font-semibold text-[#f59f0bdf] text-[8px] absolute -right-5 top-9.75">
        Max
      </span>

      <CustomHandle
        nodeId={id}
        handleId={`timeout`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: -24, top: "initial" }}
        isConnectable={true}
        className="relative border-red-400/60! text-red-400 bg-red-400/15!"
      >
        <MdHourglassEmpty
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>

      <CustomHandle
        nodeId={id}
        handleId={`not_found`}
        position={Position.Right}
        type="source"
        style={{ right: -20, bottom: -36, top: "initial" }}
        isConnectable={true}
        className="relative border-neutral-400/60! text-neutral-400 bg-neutral-400/15!"
      >
        <IoCloseCircleOutline
          size={11}
          style={{ left: -14, top: -1, position: "absolute" }}
        />
      </CustomHandle>
    </div>
  );
};
