import { FC, useContext, useState } from "react";
import { FlowContext } from "../../../../contexts/flow.context";
import { TKeyNames, DataNode } from ".";
import SelectComponent from "../../../../components/Select";

interface PatternEventFacebookConversionsProps {
  nodeId: string;
  varId?: number;
  customValue?: string | number;
  keyName: TKeyNames;
  labelName: string;
  onRemove: (keyName: TKeyNames) => void;
}

export const PatternEventFacebookConversionsComponent: FC<
  PatternEventFacebookConversionsProps
> = (props): JSX.Element => {
  const {
    options,
    reactflow: { setNodes },
  } = useContext(FlowContext);
  const [isVar, setIsVar] = useState<boolean>(false);

  return (
    <div className="group py-0.5">
      <div className="flex flex-col p-1 duration-300 focus-within:bg-white/5 hover:bg-white/5">
        <span className="text-white/75">{props.labelName}</span>
        <div className="flex flex-col items-baseline">
          {!isVar && (
            <a
              onClick={() => {
                setIsVar(true);
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === props.nodeId) {
                      node.data = {
                        ...node.data,
                        event: {
                          ...node.data.event,
                          [props.keyName]: {
                            varId: undefined,
                            customValue: undefined,
                          },
                        },
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
              style={{ fontSize: 9 }}
              className="nodrag mb-1 hidden w-full cursor-pointer rounded-sm bg-zinc-900/70 text-center duration-200 hover:bg-zinc-900/90 group-hover:block"
            >
              Selecionar uma variável
            </a>
          )}
          {!!props.varId && (
            <span
              className="nodrag mb-0.5 block cursor-pointer select-text text-blue-300 underline-offset-2 hover:text-red-400 hover:underline"
              style={{ fontSize: 8 }}
              onClick={() => {
                setIsVar(true);
                setNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === props.nodeId) {
                      node.data = {
                        ...node.data,
                        event: {
                          ...node.data.event,
                          [props.keyName]: { varId: undefined },
                        },
                      } as DataNode;
                    }
                    return node;
                  })
                );
              }}
            >
              <strong>VARIAVEL</strong> #
              {options.variables.find((s) => props.varId === s.id)?.id}{" "}
              {options.variables.find((s) => props.varId === s.id)?.name}
            </span>
          )}
          {!props.varId && isVar && (
            <label className="nodrag mb-1 w-full flex-col">
              <SelectComponent
                styles={{
                  valueContainer: { paddingLeft: 9 },
                  control: { minHeight: 20 },
                  indicatorsContainer: { padding: 5 },
                  dropdownIndicator: { padding: 3 },
                }}
                onChange={(propsV) =>
                  setNodes((nodes) =>
                    nodes.map((node) => {
                      if (node.id === props.nodeId) {
                        node.data = {
                          ...node.data,
                          event: {
                            ...node.data.event,
                            [props.keyName]: {
                              varId: propsV.value,
                              customValue: undefined,
                            },
                          },
                        } as DataNode;
                      }
                      return node;
                    })
                  )
                }
                options={options.variables.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
                isMulti={false}
                noOptionsMessage="Nenhuma variável encontrada"
                placeholder="Selecione a variável*"
                value={
                  props.varId
                    ? {
                        label:
                          options.variables.find((v) => v.id === props.varId)
                            ?.name ?? "",
                        value: Number(props.varId),
                      }
                    : undefined
                }
              />
            </label>
          )}
          <input
            type="text"
            className="nodrag w-full bg-white/5 p-0.5 pl-1 outline-0 focus:bg-white/10"
            placeholder="Valor personalizado"
            style={{ fontSize: 9 }}
            value={props.customValue || ""}
            onChange={({ target }) => {
              setIsVar(false);
              setNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === props.nodeId) {
                    node.data = {
                      ...node.data,
                      event: {
                        ...node.data.event,
                        [props.keyName]: {
                          varId: undefined,
                          customValue: target.value,
                        },
                      },
                    } as DataNode;
                  }
                  return node;
                })
              );
            }}
          />
        </div>
        <a
          className="nodrag cursor-pointer text-end text-red-500/50 underline duration-300 group-hover:text-red-500"
          style={{
            fontSize: 8,
          }}
          onClick={() => {
            setNodes((nodes) =>
              nodes.map((node) => {
                if (node.id === props.nodeId) {
                  node.data = {
                    ...node.data,
                    event: {
                      ...node.data.event,
                      [props.keyName]: {
                        varId: undefined,
                        customValue: undefined,
                      },
                    },
                  } as DataNode;
                }
                return node;
              })
            );
            props.onRemove(props.keyName);
          }}
        >
          Remover parâmetro
        </a>
      </div>
    </div>
  );
};
