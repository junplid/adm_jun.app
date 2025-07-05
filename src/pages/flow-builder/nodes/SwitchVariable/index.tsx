import { Handle, Node, Position, useUpdateNodeInternals } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { JSX, useEffect, useState } from "react";
import { Button, IconButton } from "@chakra-ui/react";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import SelectVariables from "@components/SelectVariables";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { GiDirectionSigns } from "react-icons/gi";
import { useColorModeValue } from "@components/ui/color-mode";
import { MdReportGmailerrorred } from "react-icons/md";
import { nanoid } from "nanoid";
import AutocompleteTextField from "@components/Autocomplete";
import { useGetVariablesOptions } from "../../../../hooks/variable";

type DataNode = {
  id: number;
  values: { v: string; key: string }[];
  preview: { key: string; v: string }[];
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNodeInternals = useUpdateNodeInternals();
  const { updateNode, delEdge } = useStore((s) => ({
    updateNode: s.updateNode,
    delEdge: s.delEdge,
  }));
  const { data: variables } = useGetVariablesOptions();

  const [dataMok, setDataMok] = useState(data as DataNode);
  const [init, setInit] = useState(false);
  useEffect(() => {
    if (!init) {
      setInit(true);
      return;
    }
    return () => {
      setInit(false);
    };
  }, [init]);

  useEffect(() => {
    if (!init) return;
    const debounce = setTimeout(() => updateNode(id, { data: dataMok }), 200);
    return () => {
      clearTimeout(debounce);
    };
  }, [dataMok]);

  return (
    <div className="flex flex-col -mt-3 gap-y-2">
      <Field label="Selecione a variável">
        <SelectVariables
          isMulti={false}
          isClearable={false}
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          isCreatable={false}
          value={data.id}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, id: e.value },
            });
          }}
        />
      </Field>

      <div className="my-1 flex flex-col gap-y-3">
        {data.values?.length ? (
          <div className="flex flex-col">
            <span className="font-medium text-center text-white/70">
              {data.values?.length > 1 ? "Possíveis valores" : "Possível valor"}
            </span>
            <ul className="space-y-1">
              {data.values?.map((item, index) => (
                <li
                  key={item.key}
                  className="relative flex gap-2 items-center p-1"
                >
                  <IconButton
                    size={"xs"}
                    colorPalette={"red"}
                    onClick={() => {
                      delEdge(item.key);
                      const nextItems = data.values.filter(
                        (i) => i.key !== item.key
                      );
                      const nextPreview = data.preview.filter(
                        (p) => p.key !== item.key
                      );
                      updateNode(id, {
                        data: {
                          ...data,
                          values: nextItems,
                          preview: nextPreview,
                        },
                      });
                      updateNodeInternals(id);
                    }}
                  >
                    <IoMdClose />
                  </IconButton>

                  <AutocompleteTextField
                    // @ts-expect-error
                    trigger={["{{"]}
                    options={{ "{{": variables?.map((s) => s.name) || [] }}
                    spacer={"}}"}
                    placeholder="Digite o valor ou {{valor}}"
                    defaultValue={item.v || ""}
                    onChange={(target: string) => {
                      data.preview[index].v = target;
                      data.values[index].v = target;
                      updateNodeInternals(id);
                      setDataMok({
                        ...data,
                        values: data.values,
                        preview: data.preview,
                      });
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : undefined}
        <Button
          onClick={() => {
            const itemId = nanoid();
            const values = data.values.length
              ? [...data.values, { key: itemId, v: "" }]
              : [{ key: itemId, v: "" }];

            const pp = data.preview.length
              ? [...data.preview, { key: itemId, v: "" }]
              : [{ key: itemId, v: "" }];

            updateNode(id, {
              data: { ...data, values, preview: pp },
            });
            updateNodeInternals(id);
          }}
          size={"sm"}
          colorPalette={"green"}
        >
          {" "}
          <IoMdAdd size={14} /> Possível valor
        </Button>
      </div>
    </div>
  );
}

export const NodeSwitchVariable: React.FC<Node<DataNode>> = (props) => {
  const colorFailed = useColorModeValue("#F94A65", "#B1474A");

  return (
    <div>
      <PatternNode.PatternPopover
        size="290px"
        title="Switch de variável"
        description="Verifica a variável e direciona o fluxo"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        node={{
          children: (
            <div
              style={{
                height:
                  props.data.preview?.filter((s) => s.v).filter((s) => s.v)
                    ?.length >= 2
                    ? 14 * props.data.preview.filter((s) => s.v)?.length +
                      42 -
                      35
                    : 35,
              }}
              className="p-1 relative items-center flex"
            >
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={props.id} />
              </div>
              <GiDirectionSigns className="dark:text-white/70" size={27} />
            </div>
          ),
          name: "Variável",
          description: "Switch de",
        }}
      >
        <BodyNode data={props.data} id={props.id} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
      {props.data?.preview
        ?.filter((s) => s.v)
        ?.map((p, index: number) => (
          <CustomHandle
            nodeId={props.id}
            isConnectable
            handleId={p.key}
            key={p.key}
            type="source"
            position={Position.Right}
            style={{ right: -34, top: 14 * index + 6 }}
            className="relative"
          >
            <span
              style={{ fontSize: 9, top: -3, left: -27.8 }}
              className={
                "absolute cursor-default w-6 justify-between flex items-center -left-[30.8px] font-medium"
              }
            >
              <span style={{ fontSize: 9 }}>{"["}</span>
              <span style={{ fontSize: 6 }} className="">
                {p.v.split("").splice(0, 3)}
              </span>
              <span style={{ fontSize: 9 }}>{"]"}</span>
            </span>
          </CustomHandle>
        ))}

      {!!props.data.preview?.filter((s) => s.v).length && (
        <CustomHandle
          nodeId={props.id}
          handleId={`${colorFailed} failed`}
          position={Position.Right}
          type="source"
          style={{ right: -20, bottom: -3, top: "initial" }}
          isConnectable={true}
          title="Tempo esgotado"
          className="relative dark:text-red-400 text-red-500 dark:!border-red-400/60 dark:!bg-red-400/15 !border-red-500/70 !bg-red-500/15"
        >
          <MdReportGmailerrorred
            size={11}
            style={{ left: -14, top: -1, position: "absolute" }}
          />
        </CustomHandle>
      )}
    </div>
  );
};
