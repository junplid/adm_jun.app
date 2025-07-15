import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { CgCalculator } from "react-icons/cg";
import useStore from "../../flowStore";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import { CustomHandle } from "../../customs/node";
import AutocompleteTextField from "@components/Autocomplete";
import SelectVariables from "@components/SelectVariables";
import { Field } from "@components/ui/field";

type DataNode = {
  formula: string;
  variableId: number;
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
    <div className="flex flex-col gap-y-3 px-1 pb-1 pt-2 -mt-4">
      <AutocompleteTextField
        // @ts-expect-error
        trigger={["{{"]}
        options={{ "{{": variables?.map((s) => s.name) || [] }}
        spacer={"}} "}
        type="textarea"
        placeholder="{{total}} + 1"
        defaultValue={data.formula || ""}
        onChange={(value: string) => setDataMok({ ...data, formula: value })}
      />
      <Field label="Salve o resultado em uma variável">
        <SelectVariables
          value={data.variableId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, { data: { ...data, variableId: v.value } });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>
    </div>
  );
}

export const NodeCalculator: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de calculadora"
        description="Cria cálculos matemáticos"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <CgCalculator className="dark:text-white text-black" size={27} />
            </div>
          ),
          name: "Calculadora",
          description: "Utilizar",
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
