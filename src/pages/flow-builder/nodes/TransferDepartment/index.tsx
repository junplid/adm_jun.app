import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX } from "react";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectInboxDepartments from "@components/SelectInboxDepartments";
import { LuBriefcaseBusiness } from "react-icons/lu";

type DataNode = {
  id: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));

  return (
    <div className="flex flex-col -mt-3">
      <Field
        helperText="O departamento será notificado imediatamente."
        label="Selecione o departamento"
      >
        <SelectInboxDepartments
          isMulti={false}
          isFlow
          isClearable={false}
          onChange={(e: any) => updateNode(id, { data: { id: e.value } })}
          value={data.id}
        />
      </Field>
    </div>
  );
}

export const NodeTransferDepartment: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de transferir departamento"
        description="Transferir a conversa para um departamento."
        size="330px"
        node={{
          size: "75px",
          children: (
            <div className="w-full p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <LuBriefcaseBusiness
                className="dark:text-neutral-300 text-neutral-800 mx-auto"
                size={26.8}
              />
            </div>
          ),
          name: "Departamento",
          description: "Transfere para",
        }}
      >
        <BodyNode id={id} data={data} />
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
