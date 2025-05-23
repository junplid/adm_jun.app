import { Input } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineEnvironment, AiOutlineFieldTime } from "react-icons/ai";
import { Handle, Node, Position, useReactFlow, useStoreApi } from "reactflow";
import { CustomHandle } from "../../customs/node";
import { PatternNode } from "../Pattern";
import SelectComponent from "../../../../components/Select";
import { FlowContext } from "../../../../contexts/flow.context";

interface DataNode {
  interval: number;
  geolocationId: number;
}

export const NodeSendLocationGPS: React.FC<Node> = ({ id }) => {
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
    if (!options.geolocations.length && isFirst) {
      actions.getGeolocations();
      setIsFirst(true);
    }
  }, [options.geolocations.length, isFirst]);

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
      isConnectable={isConnectable ? startConnection?.id !== id : isConnectable}
      header={{
        icon: AiOutlineEnvironment,
        label: "Enviar localização",
        style: {
          bgColor: "#bb7608",
          color: "#ffffff",
        },
      }}
    >
      <div>
        <div className="mt-2 flex flex-col gap-2 p-2">
          <label className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-700 p-2">
            <span style={{ fontSize: 9 }}>Digitando...</span>
            <div className="flex items-center gap-2">
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#354564"}
                size={"xs"}
                width={"14"}
                type="number"
                min={0}
                fontSize={10}
                title={`${data.interval ?? 0} Segundos`}
                value={data.interval ?? "0"}
                onChange={({ target }) => {
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      const dataN: DataNode = node.data;
                      if (node.id === id) {
                        node.data = {
                          ...dataN,
                          interval: Number(target.value),
                        } as DataNode;
                      }
                      return node;
                    })
                  );
                }}
              />
              <AiOutlineFieldTime size={18} />
            </div>
          </label>
          <label className="nodrag flex flex-col gap-y-1">
            <span className="font-semibold text-white/80">
              Selecione a geolocalização
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
                        geolocationId: propsV.value,
                      } as DataNode;
                    }
                    return node;
                  })
                )
              }
              options={options.geolocations.map((st) => ({
                label: st.name,
                value: st.id,
              }))}
              isMulti={false}
              noOptionsMessage="Nenhuma geolocalização encontrada"
              placeholder="Geolocalização*"
              value={
                data.geolocationId
                  ? {
                      label:
                        options.geolocations.find(
                          (v) => v.id === data.geolocationId
                        )?.name ?? "",
                      value: data.geolocationId,
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
          style={{ left: -15 }}
          position={Position.Left}
        />
        <CustomHandle
          handleId={"main"}
          nodeId={id}
          type="source"
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ right: -15 }}
        />

        <PatternNode.Actions id={id} />
      </div>
    </PatternNode.PatternContainer>
  );
};
