import { useMemo, useState } from "react";
import SelectComponent from "../../../../components/Select";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { DataNode, TKeyNames } from ".";
import { PatternEventFacebookConversionsComponent } from "./PatternEvent";
import { dataInputs } from "./datas";
// import { FlowContext } from "../../../../contexts/flow.context";
// import { v4 } from "uuid";

interface ICustomDataProps {
  inputs: TKeyNames[];
  nodeId: string;
  title: string;
  event: DataNode["event"];
}

export function CustomDataFbConversionComponent(
  props: ICustomDataProps
): JSX.Element {
  // const {
  //   reactflow: { setNodes },
  // } = useContext(FlowContext);
  const [paramsSelected, setParamsSelected] = useState<string[]>([]);
  const [viewContent, setViewContent] = useState(true);

  const nextDataInputs = useMemo(() => {
    return dataInputs.filter((d) => props.inputs.includes(d.keyName));
  }, [props.inputs]);

  return (
    <div className="flex flex-col">
      <div className="mb-1 flex w-full items-center justify-center gap-x-2">
        <span className="block text-center font-semibold">{props.title}</span>
        {!!paramsSelected.length && (
          <a
            onClick={() => setViewContent((s) => !s)}
            className={
              (!viewContent ? "text-zinc-600" : "text-zinc-100") +
              " cursor-pointer nodrag duration-300"
            }
            title="Mostrar/ocultar campos"
          >
            {!viewContent ? <IoEyeOff size={15} /> : <IoEye size={15} />}
          </a>
        )}
      </div>
      {viewContent &&
        nextDataInputs
          .filter((s) => paramsSelected.includes(s.keyName))
          .map((input) => (
            <PatternEventFacebookConversionsComponent
              {...props.event?.[input.keyName]}
              {...input}
              nodeId={props.nodeId}
              key={input.keyName}
              onRemove={() =>
                setParamsSelected((s) => s.filter((v) => v !== input.keyName))
              }
            />
          ))}
      {/* {viewContent && props.inputs.includes("customContents") && (
        <div className="flex flex-col">
          <span>Items ou produtos</span>
          {props.event.customContents.map(c => (
            <div>
              <input type="text" />
            </div>
          ))}
          <div>

          </div>
          <a
            className="cursor-pointer nodrag"
            onClick={() => {
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === props.nodeId) {
                    console.log(node.data.event);
                    node.data = {
                      ...node.data,
                      event: {
                        ...node.data.event,
                        customContents: [
                          ...node.data.event.customContents,
                          { key: v4() },
                        ],
                      },
                    } as DataNode;
                  }
                  return node;
                })
              );
            }}
          >
            Adicionar
          </a>
        </div>
      )} */}
      {!!nextDataInputs.filter((d) => !paramsSelected.includes(d.keyName))
        .length && (
        <div className="nodrag mt-1">
          <SelectComponent
            styles={{
              valueContainer: { paddingLeft: 9 },
              control: { minHeight: 20 },
              indicatorsContainer: { padding: 5 },
              dropdownIndicator: { padding: 3 },
            }}
            onChange={(propsV) => {
              setViewContent(true);
              setParamsSelected([...paramsSelected, String(propsV.value)]);
            }}
            options={nextDataInputs
              .filter((d) => !paramsSelected.includes(d.keyName))
              .map((v) => ({
                label: v.labelName,
                value: v.keyName,
              }))}
            isMulti={false}
            noOptionsMessage="Nenhuma parâmetro encontrado"
            placeholder="Selecione o parâmetro"
            value={null}
          />
        </div>
      )}
    </div>
  );
}
