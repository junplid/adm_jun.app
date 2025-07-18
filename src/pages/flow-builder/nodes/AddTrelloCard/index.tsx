import { JSX, useEffect, useState } from "react";
import { Handle, Node, Position } from "@xyflow/react";
import { PatternNode } from "../Pattern";
import useStore from "../../flowStore";
import { CustomHandle } from "../../customs/node";
import { Field } from "@components/ui/field";
import AutocompleteTextField from "@components/Autocomplete";
import { useGetVariablesOptions } from "../../../../hooks/variable";
import SelectTrelloIntegrations from "@components/SelectTrelloIntegrations";
import { Input } from "@chakra-ui/react";
// import { FaTrash } from "react-icons/fa";
import { RiTrelloLine } from "react-icons/ri";
import SelectVariables from "@components/SelectVariables";
import SelectBoardsTrelloIntegration from "@components/SelectBoardsTrelloIntegration";
import SelectListsOnBoardTrelloIntegration from "@components/SelectListsOnBoardTrelloIntegration";

type DataNode = {
  trelloIntegrationId: number;
  boardId: string;
  listId: string;
  name: string;
  desc?: string;
  // labels: { name: string; color: string }[];
  varId_save_cardId?: number;
};

function BodyNode({ id, data }: { id: string; data: DataNode }): JSX.Element {
  const updateNode = useStore((s) => s.updateNode);
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
    <div className="flex flex-col -mt-3 mb-5 gap-y-3">
      <Field label="Selecione a integração">
        <SelectTrelloIntegrations
          value={data.trelloIntegrationId}
          isMulti={false}
          isClearable={false}
          onChange={(v: any) => {
            updateNode(id, {
              data: { ...data, trelloIntegrationId: v.value },
            });
          }}
          menuPlacement="bottom"
          isFlow
        />
      </Field>

      {data.trelloIntegrationId && (
        <Field label="Selecione o quadro">
          <SelectBoardsTrelloIntegration
            trelloIntegrationId={data.trelloIntegrationId}
            value={data.boardId}
            isMulti={false}
            isClearable={false}
            onChange={(v: any) => {
              updateNode(id, {
                data: { ...data, boardId: v.value },
              });
            }}
            menuPlacement="bottom"
            isFlow
          />
        </Field>
      )}

      {data.boardId && (
        <Field label="Selecione a lista">
          <SelectListsOnBoardTrelloIntegration
            trelloIntegrationId={data.trelloIntegrationId}
            boardId={data.boardId}
            value={data.listId}
            isMulti={false}
            isClearable={false}
            onChange={(v: any) => {
              updateNode(id, {
                data: { ...data, listId: v.value },
              });
            }}
            menuPlacement="bottom"
            isFlow
          />
        </Field>
      )}

      <Field label="Título do Card">
        <Input
          defaultValue={data.name || ""}
          onChange={({ target }) => {
            updateNode(id, {
              data: { ...data, name: target.value },
            });
          }}
        />
      </Field>

      <AutocompleteTextField
        // @ts-expect-error
        trigger={["/", "{{"]}
        maxOptions={20}
        matchAny
        options={{
          "{{": variables?.map((s) => s.name + "}} ") || [],
        }}
        maxRows={14}
        minRows={5}
        defaultValue={data.desc || ""}
        type="textarea"
        placeholder={`Descrição`}
        onChange={async (target: string) => {
          setDataMok({
            ...data,
            desc: target,
          });
        }}
      />

      {/* <span>Etiquetas</span>
      <div className="flex flex-col gap-y-1 -mt-2 w-full">
        {!!!dataMok.labels.length && (
          <span className="text-center w-full text-white/70">
            Nenhuma etiqueta será adicionada*
          </span>
        )}
        {dataMok.labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-x-2">
            <Input
              placeholder="Nome da etiqueta"
              value={label.name}
              size={"xs"}
              onChange={({ target }) => {
                const newLabels = [...(dataMok.labels || [])];
                newLabels[idx] = { ...newLabels[idx], name: target.value };
                setDataMok({ ...dataMok, labels: newLabels });
              }}
            />
            <Input
              unstyled
              type="color"
              value={label.color}
              onChange={({ target }) => {
                const newLabels = [...(dataMok.labels || [])];
                newLabels[idx] = { ...newLabels[idx], color: target.value };
                setDataMok({ ...dataMok, labels: newLabels });
              }}
            />
            <IconButton
              variant="ghost"
              onClick={() => {
                const newLabels = (dataMok.labels || []).filter(
                  (_, i) => i !== idx
                );
                setDataMok({ ...dataMok, labels: newLabels });
              }}
            >
              <FaTrash className="text-red-500" />
            </IconButton>
          </div>
        ))}
        <Button
          colorPalette={"green"}
          onClick={() => {
            setDataMok({
              ...dataMok,
              labels: [
                ...(dataMok.labels || []),
                { name: "", color: "#000000" },
              ],
            });
          }}
          className="mt-2"
        >
          Adicionar etiqueta
        </Button>
      </div> */}

      <Field label="Salvar ID do card">
        <SelectVariables
          isMulti={false}
          isClearable
          placeholder="Selecione uma variável"
          menuPlacement="bottom"
          isFlow
          value={data.varId_save_cardId}
          onChange={(e: any) => {
            updateNode(id, {
              data: { ...data, varId_save_cardId: e.value },
            });
          }}
        />
      </Field>
    </div>
  );
}

export const NodeAddTrelloCard: React.FC<Node<DataNode>> = ({ id, data }) => {
  return (
    <div>
      <PatternNode.PatternPopover
        title="Adicionar card no Trello"
        description="Adicione um card na lista do quadro"
        positioning={{ flip: ["left", "right"], placement: "left" }}
        size="320px"
        node={{
          children: (
            <div className="p-0.5 relative">
              <div className="flex justify-end absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 duration-200">
                <PatternNode.Actions id={id} />
              </div>
              <RiTrelloLine
                className="dark:text-green-400  text-green-500"
                size={31}
              />
            </div>
          ),
          name: "Card",
          description: "Adicionar",
        }}
      >
        <BodyNode id={id} data={data} />
      </PatternNode.PatternPopover>

      <Handle type="target" position={Position.Left} style={{ left: -8 }} />
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
