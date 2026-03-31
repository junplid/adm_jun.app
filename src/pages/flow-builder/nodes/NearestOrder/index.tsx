import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import AutocompleteTextField from "@components/Autocomplete";
import { CustomHandle } from "../../customs/node";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { TiFlash } from "react-icons/ti";
import { FaRoute } from "react-icons/fa";

type DataNode = {
  geo_string: string; // -99,99999|99,99999
  varId_save_code_order?: number;
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
      <Field label="Geolocalização">
        <AutocompleteTextField
          // @ts-expect-error
          trigger={["{{"]}
          options={{ "{{": variables?.map((s) => s.name) || [] }}
          spacer={"}}"}
          defaultValue={data.geo_string || ""}
          onChange={(value: string) =>
            setDataMok({ ...data, geo_string: value })
          }
        />
      </Field>

      <Field label="Salvar codigo do pedido">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          isFlow
          menuPlacement="bottom"
          filter={(opt) => opt.filter((s) => s.type === "dynamics")}
          onCreate={(tag) => {
            updateNode(id, {
              data: { ...data, varId_save_code_order: tag.id },
            });
          }}
          value={data.varId_save_code_order}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_save_code_order: e.value },
            });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeNearestOrder: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de buscar pedido mais proximo"
        description="Busca um pedido mais proximo"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-1.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <FaRoute className="text-gray-400" size={23} />
            </div>
          ),
          name: "Proximo",
          description: "Pedido",
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
        style={{ right: -9, top: 11 }}
        isConnectable={true}
      />
      <span className="absolute -right-3.75 top-6 text-yellow-400">
        <TiFlash size={13} />
      </span>
      <CustomHandle
        nodeId={id}
        handleId={`#b99909 not_found`}
        position={Position.Right}
        type="source"
        style={{ right: -20, top: 30 }}
        isConnectable={true}
        className="border-yellow-400/60! bg-yellow-400/15!"
      />
    </div>
  );
};
