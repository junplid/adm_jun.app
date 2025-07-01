import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { PiFlowArrowBold } from "react-icons/pi";
import useStore from "../../flowStore";
import { JSX } from "react";
import { useDBNodes, useFlows } from "../../../../db";
import { Link, useNavigate, useParams } from "react-router-dom";
import SelectFlows from "@components/SelectFlows";

type DataNode = {
  id: string;
};

function BodyNode({ id }: { id: string }): JSX.Element {
  const nodes = useDBNodes();
  const node = nodes.find((s) => s.id === id) as Node<DataNode> | undefined;
  const flows = useFlows();
  const navigate = useNavigate();
  const { updateNode } = useStore((s) => ({ updateNode: s.updateNode }));
  const params = useParams<{ id: string }>();

  if (!node) {
    return <span>Não encontrado</span>;
  }

  return (
    <div className="flex flex-col -mt-3">
      <SelectFlows
        isCreatable
        isFlow
        isClearable={false}
        isMulti={false}
        value={node.data.id}
        onChange={(e: any) => updateNode(id, { data: { id: e.value } })}
        onCreate={async (flow) => {
          updateNode(id, { data: { id: flow.id } });
          await new Promise((resolve) => setTimeout(resolve, 120));
          navigate(`/auth/flows/${flow.id}`);
        }}
      />
      {node.data.id && params.id !== node.data.id && (
        <div className="text-xs text-neutral-500 mt-1">
          Ir para:{" "}
          <Link
            to={`/auth/flows/${node.data.id}`}
            className="text-blue-500 hover:underline text-sm"
          >
            {flows.find((s) => s.id === node.data.id)?.name}
          </Link>
        </div>
      )}
    </div>
  );
}

export const NodeSendFlow: React.FC<Node<DataNode>> = ({ id }) => {
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
              <PiFlowArrowBold
                className="dark:text-neutral-300 text-neutral-800"
                size={26.8}
              />
            </div>
          ),
          name: "Fluxo",
          description: "Enviar",
        }}
      >
        <BodyNode id={id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
    </div>
  );
};
