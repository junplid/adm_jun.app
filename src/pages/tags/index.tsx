import { JSX, useMemo } from "react";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteTag } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewTag } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditTag } from "./modals/edit";
import { useDialogModal } from "../../hooks/dialog.modal";
import { useGetTags } from "../../hooks/tag";
import { TagType } from "../../services/api/Tag";

export interface TagRow {
  id: number;
  name: string;
  type: TagType;
  records: number;
  businesses: { id: number; name: string }[];
}

// const translateType: {
//   [x in TagType]: { label: string; cb: string; ct: string };
// } = {
//   audience: { label: "Público", cb: "#294d6e", ct: "#dcf4ff" },
//   contact: { label: "Lead", cb: "#836e21", ct: "#fff" },
// };

export const TagsPage: React.FC = (): JSX.Element => {
  const { data: tags, isFetching, isPending } = useGetTags();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome da etiqueta",
      },
      {
        key: "records",
        name: "Registros",
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalViewTag
                        isDelete={row.type !== "system"}
                        close={close}
                        id={row.id}
                      />
                    ),
                  })
                }
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
              >
                <LuEye color={"#dbdbdb"} />
              </Button>
              <Button
                onClick={() => {
                  onOpen({
                    content: <ModalEditTag close={close} id={row.id} />,
                  });
                }}
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteTag
                        data={{ id: row.id, name: row.name }}
                        close={close}
                      />
                    ),
                  });
                }}
              >
                <MdDeleteOutline color={"#f75050"} />
              </Button>
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Etiquetas</h1>
          <ModalCreateFlow
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Classifique e organize seus leads por interesses, ações e
          comportamentos para tomar decisões mais estratégicas.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="flex-1 grid">
        <TableComponent
          rows={tags || []}
          columns={renderColumns}
          textEmpity="Suas etiquetas aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
