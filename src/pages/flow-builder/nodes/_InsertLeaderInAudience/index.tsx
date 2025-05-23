import { useContext, useEffect, useMemo, useState } from "react";
import { TbTextSize } from "react-icons/tb";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import SelectComponent from "../../../../components/Select";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import { FlowContext } from "../../../../contexts/flow.context";

type DataNode = {
  audienceId: number;
};

export const NodeInsertLeaderInAudience: React.FC<Node> = ({ id }) => {
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

  const data = useMemo(() => {
    const dataNode = store.getState().nodeInternals.get(id)?.data;
    return dataNode as DataNode;
  }, [store.getState().nodeInternals.get(id)?.data]);

  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!options.campaignAudiences.length && isFirst) {
      actions.getCampaignAudience();
      setIsFirst(true);
    }
  }, [options.campaignAudiences.length, isFirst]);

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
      style={{
        bgColor: "#131821",
        color: "#ffffff",
      }}
      header={{
        icon: TbTextSize,
        label: "Inserir lead em um público",
        style: {
          bgColor: "#c34c07",
          color: "#ffffff",
        },
      }}
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
    >
      <div className="py-2 pb-1">
        <div className="mt-2 flex flex-col gap-2">
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione o público
              <strong className="text-red-500">*</strong>
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
              onChange={(propsV) => {
                setNodes((nodes) =>
                  nodes.map((node) => {
                    const dataN: DataNode = node.data;
                    if (node.id === id) {
                      node.data = {
                        ...dataN,
                        audienceId: Number(propsV.value),
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              options={options.campaignAudiences.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhum público encontrado"
              placeholder="Selecione um público"
              value={
                data.audienceId
                  ? {
                      label:
                        options.campaignAudiences.find(
                          (s) => s.id === data.audienceId
                        )?.name ?? "",
                      value: data.audienceId,
                    }
                  : undefined
              }
            />
          </label>
        </div>

        <Handle
          type="target"
          isConnectable={
            isConnectable ? startConnection?.id !== id : isConnectable
          }
          position={Position.Left}
          style={{ left: -15 }}
        />
        <CustomHandle
          nodeId={id}
          handleId={"main"}
          isConnectable={isConnectable}
          type="source"
          position={Position.Right}
          style={{ right: -15 }}
        />
        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
