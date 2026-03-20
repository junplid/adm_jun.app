import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiFlowArrowBold } from "react-icons/pi";
import useStore from "../../flowStore";
import { JSX } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SelectFlows from "@components/SelectFlows";
import { useGetFlowsOptions } from "../../../../hooks/flow";

type DataNode = {
  id: string;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const { data: flows } = useGetFlowsOptions();
  const navigate = useNavigate();
  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));
  const params = useParams<{ id: string }>();

  return (
    <div className="flex flex-col -mt-3">
      <SelectFlows
        isCreatable
        isFlow
        isClearable={false}
        isMulti={false}
        value={data.id}
        onChange={(e: any) => updateNode(id, { data: { id: e.value } })}
        onCreate={async (flow) => {
          updateNode(id, { data: { id: flow.id } });
          await new Promise((resolve) => setTimeout(resolve, 120));
          navigate(`/auth/flows/${flow.id}`);
        }}
      />
      {data.id && params.id !== data.id && (
        <div className="text-xs text-neutral-500 mt-1">
          Ir para:{" "}
          <Link
            to={`/auth/flows/${data.id}`}
            className="text-blue-500 hover:underline text-sm"
          >
            {flows?.find((s) => s.id === data.id)?.name}
          </Link>
        </div>
      )}
    </div>
  );
}

export const NodeSendFlow: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node de enviar fluxo"
        description="Transferir a conversa para outro fluxo"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <PiFlowArrowBold className="text-neutral-300" size={26.8} />
            </div>
          ),
          name: "Fluxo",
          description: "Enviar",
        }}
      >
        <BodyNode id={id} data={data} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
    </div>
  );
};
