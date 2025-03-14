import { Textarea } from "@chakra-ui/react";
import { LiaComment } from "react-icons/lia";
import { Node, useReactFlow, useStoreApi } from "reactflow";
import { PatternNode } from "../Pattern";

export const NodeRemark: React.FC<Node> = ({ id }) => {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();

  return (
    <PatternNode.PatternContainer
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      header={{
        icon: LiaComment,
        label: "Comentário",
        style: {
          bgColor: "#09900b",
          color: "#ffffff",
        },
      }}
    >
      <div className="pt-2">
        <Textarea
          focusBorderColor="#f6bb0b"
          borderColor={"transparent"}
          background={"transparent"}
          padding={"2"}
          paddingLeft={2}
          resize={"none"}
          className="nodrag rounded-lg rounded-tl-none p-1 pr-4 leading-tight"
          style={{
            // boxShadow: "0 1px 1px #0707071d",
            fontSize: 10,
            // background: "#1a4246",
          }}
          value={store.getState().nodeInternals.get(id)?.data.message ?? ""}
          onChange={({ target }) => {
            const { nodeInternals } = store.getState();
            const arrayNodes = Array.from(nodeInternals.values());
            setNodes(
              arrayNodes.map((node) => {
                if (node.id === id) {
                  node.data = { ...node.data, message: target.value };
                }
                return node;
              })
            );
          }}
          onInput={({ target }) => {
            //@ts-expect-error
            target.style.height = "auto";
            //@ts-expect-error
            target.style.height = target.scrollHeight + 2 + "px";
          }}
          placeholder="Seu comentário aqui"
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
