import { Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import { JSX } from "react";
import { CustomHandle } from "../../customs/node";
import { FaRoute } from "react-icons/fa";
import { PiEarBold } from "react-icons/pi";

type DataNode = {};

function BodyNode(_props: { id: string; data: DataNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-y-3 -mt-3">
      <span>
        Ao receber webhook de rota aceita. Esse nó será associado carregando
        conteúdo de texto contendo "CODE_ROUTER=999999" que poderá ser capturado
        utilizando o Node de Resposta
      </span>
    </div>
  );
}

export const NodeRouterAcceptance: React.FC<Node<DataNode>> = ({
  id,
  data,
}) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Node webhook aceitação de rota"
        description={
          'Fica escultando quando uma rota é aceita usando o link de "Link de aceitar rota" do node "Buscar Rota"'
        }
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="330px"
        node={{
          children: (
            <div className="p-1 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <PiEarBold className="text-white translate-x-1" size={26.8} />
              <FaRoute
                className="text-red-300 absolute top-4 left-px"
                size={13}
              />
            </div>
          ),
          name: "Rota aceita",
          description: "Escutar",
        }}
      >
        <BodyNode data={data} id={id} />
      </PatternNode.PatternPopover>

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
