import { Input } from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import { Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { AiOutlineLineChart } from "react-icons/ai";
import CopyToClipboard from "react-copy-to-clipboard";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { DataConfigContext } from "../../../../contexts/dataConfig.context";
import { FlowContext } from "../../../../contexts/flow.context";

type DataNode = {
  event: string;
  value: string;
};

const CodeBlock = (props: any) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative">
      <CopyToClipboard
        text={props.children[0]}
        onCopy={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        <button
          style={{ fontSize: 8 }}
          className="py0.5 absolute right-1 top-2 hidden -translate-y-1 bg-blue-700/60 px-1 duration-300  group-hover:block"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </CopyToClipboard>
      <SyntaxHighlighter
        language={props.language}
        style={oneDark}
        customStyle={{
          padding: 5,
          fontSize: 9,
        }}
      >
        {props.children[0]}
      </SyntaxHighlighter>
    </div>
  );
};

export const NodeInterruptionLinkTrackingPixel: React.FC<Node> = ({
  id,
}): JSX.Element => {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { "url-plataform-adm": UrlPlataformADM } =
    useContext(DataConfigContext);

  const {
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const markdownContent = useMemo(() => {
    return `
    <script>
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('w');

      await axios.post(
        \`${
          UrlPlataformADM ?? "http://localhost:4000"
        }/api/v1/access/link-tacking-pixel?token=\${token}\`,
        { event: "${data.event ?? ""}", value: "${data.value ?? ""}" },
      ).
        then(({data}) => {
          console.log(data);
        }).catch(err => {
          console.log(err);
        });
    </script>
    <!-- Importação do Axios -->
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  `;
  }, [data]);

  const isConnectable = useMemo(() => {
    if (startConnection) {
      if (startConnection.id === id) {
        return true;
      } else {
        if (
          !listIdNodesLineDependent.includes(id) &&
          !listLinesIdNodesInterruoption.includes(id)
        ) {
          return true;
        }

        if (listLinesIdNodesInterruoption.includes(startConnection.id)) {
          if (listIdNodesLineDependent.includes(id)) return false;
          return true;
        }
        if (listIdNodesLineDependent.includes(startConnection.id)) {
          if (listLinesIdNodesInterruoption.includes(id)) return false;
          return true;
        }
      }
    } else {
      return true;
    }
  }, [startConnection?.hash]);

  return (
    <PatternNode.PatternContainer
      size="210px"
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      isConnectable={isConnectable}
      header={{
        icon: AiOutlineLineChart,
        label: "Reação link de rastreio",
        style: {
          bgColor: "#ad073c",
          color: "#ffffff",
        },
      }}
    >
      <div className="nopan flex flex-col gap-y-2 px-1 py-2 pb-1">
        <i className="text-white/60">
          Este bloco executa quando o lead dispara algum evento rastreado pelo
          link de rastreio
        </i>
        <label className="flex flex-col justify-between gap-y-1">
          <span style={{ fontSize: 10 }}>Nome do evento</span>
          <Input
            focusBorderColor="#f6bb0b"
            borderColor={"#354564"}
            size={"xs"}
            type="text"
            fontSize={10}
            value={data.event ?? ""}
            placeholder="ex: Clique"
            onChange={({ target }) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = {
                      ...dataN,
                      event: target.value,
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
          />
        </label>
        <label className="flex flex-col justify-between gap-y-1">
          <span style={{ fontSize: 10 }}>Valor esperado do evento</span>
          <Input
            focusBorderColor="#f6bb0b"
            borderColor={"#354564"}
            size={"xs"}
            type="text"
            fontSize={10}
            placeholder="ex: Botão comprar"
            value={data.value ?? ""}
            onChange={({ target }) => {
              setNodes((nodes) => {
                return nodes?.map((node) => {
                  if (node.id === id) {
                    const dataN: DataNode = node.data;
                    node.data = {
                      ...dataN,
                      value: target.value,
                    } as DataNode;
                  }
                  return node;
                });
              });
            }}
          />
        </label>

        <strong>
          Copie e cole o codigo abaixo dentro do {"<body>...</body>"} do seu
          site
        </strong>

        <div className="nodrag cursor-text select-text bg-slate-800/60 p-1 py-0.5">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              a({ node, ...rest }) {
                return <span {...rest} />;
              },
              ul({ node, ...rest }) {
                return <ul className="list-disc pl-5" {...rest} />;
              },
              em({ node, ...rest }) {
                return <em className="text-white/60" {...rest} />;
              },
              h2({ node, ...rest }) {
                return <h2 className="my-2 text-lg font-semibold" {...rest} />;
              },
              p({ node, ...rest }) {
                return <p className="block whitespace-nowrap" {...rest} />;
              },
            }}
          >
            {markdownContent}
          </Markdown>
        </div>

        <div className="pointer-events-none fixed -bottom-4 left-1/2 -translate-x-1/2 rounded-sm bg-white/5 px-1 text-white/60">
          <span className="tracking-widest" style={{ fontSize: 7 }}>
            {id}
          </span>
        </div>

        <CustomHandle
          type="source"
          handleId="green main"
          nodeId={id}
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ top: "30%", right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
