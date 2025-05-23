import { Button } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";
import { AiOutlineFlag } from "react-icons/ai";

interface DataNode {
  checkPointId: number;
}

export const NodeCheckPoint: React.FC<Node> = ({ id }): JSX.Element => {
  const {
    options,
    actions,
    reactflow: {
      listLinesIdNodesInterruoption,
      listIdNodesLineDependent,
      startConnection,
    },
  } = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [loadCreateCheckPoint, setLoadCreateCheckPoint] =
    useState<boolean>(false);

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.checkpoints.length && isFirst) {
      actions.getCheckpoints();
      setIsFirst(true);
    }
  }, [options.checkpoints.length, isFirst]);

  const isConnectable = useMemo(() => {
    if (startConnection) {
      if (startConnection.id === id) {
        return false;
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
      size="230px"
      style={{ bgColor: "#131821", color: "#ffffff" }}
      header={{
        icon: AiOutlineFlag,
        label: "Check point",
        style: { bgColor: "#5d0888", color: "#ffffff" },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="nopan flex flex-col gap-y-1 px-1 pb-1 pt-2">
        <p>Mapeia os leads que passam neste bloco</p>
        <label className="nodrag flex flex-col gap-y-1">
          <span className="font-semibold text-white/80">
            Selecione o check point
          </span>
          <SelectComponent
            styles={{
              valueContainer: {
                paddingLeft: 9,
              },
              control: { minHeight: 20 },
              indicatorsContainer: { padding: 5 },
              dropdownIndicator: { padding: 3 },
            }}
            onChange={(propsV) =>
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === id) {
                    node.data = {
                      ...node.data,
                      checkPointId: Number(propsV.value),
                    } as DataNode;
                  }
                  return node;
                })
              )
            }
            buttonEmpityOnSubmitNewItem={({ value }) => (
              <Button
                type="button"
                colorScheme="green"
                onClick={async () => {
                  setLoadCreateCheckPoint(true);
                  await actions.createCheckpoint(value);
                  setLoadCreateCheckPoint(false);
                }}
                isLoading={loadCreateCheckPoint}
              >
                <span style={{ fontSize: 11 }}>Criar check point</span>
              </Button>
            )}
            options={options.checkpoints.map((v) => ({
              label: v.name,
              value: v.id,
            }))}
            isMulti={false}
            noOptionsMessage="Nenhuma check point encontrado"
            placeholder="Selecione o checkpoint*"
            value={
              data.checkPointId
                ? {
                    label:
                      options.checkpoints.find(
                        (v) => v.id === data.checkPointId
                      )?.name ?? "",
                    value: Number(data.checkPointId),
                  }
                : undefined
            }
          />
        </label>

        <Handle
          type="target"
          position={Position.Left}
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          style={{ top: "30%", left: -15 }}
        />
        <Handle
          type="source"
          id="main"
          position={Position.Right}
          style={{ top: "30%", right: -15 }}
          isConnectable={isConnectable}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
