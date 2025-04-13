import { JSX, useContext, useEffect, useMemo, useState } from "react";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteFlow } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewFlow } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditFlow } from "./modals/edit";
import { useGetVariables } from "../../hooks/variable";
import { DialogContext } from "@contexts/dialog.context";

export type TypeVariable = "dynamics" | "constant" | "system";

export interface VariableRow {
  business: { name: string; id: number }[];
  type: TypeVariable;
  name: string;
  id: number;
  value: string | null;
}

const translateType: {
  [x in TypeVariable]: { label: string; cb: string; ct: string };
} = {
  dynamics: { label: "Mutável", cb: "#294d6e", ct: "#dcf4ff" },
  constant: { label: "Imutável", cb: "#836e21", ct: "#fff" },
  system: { label: "Sistema", cb: "#373a3d", ct: "#cfcfcf" },
};

export const VariablesPage: React.FC = (): JSX.Element => {
  const { onOpen, close } = useContext(DialogContext);
  const { data: variables, isFetching, isPending } = useGetVariables();

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "type",
        name: "Tipo",
        styles: { width: 100 },
        render(row) {
          const type = row.type as TypeVariable;
          return (
            <div className="flex">
              <span
                style={{
                  background: translateType[type].cb,
                  color: translateType[type].ct,
                }}
                className="flex p-0.5 px-2 gap-x-2 text-sm tracking-wide select-none items-center font-semibold rounded-sm"
              >
                {translateType[type].label}
              </span>
            </div>
          );
        },
      },
      {
        key: "name",
        name: "Nome da variável",
        render(row) {
          return (
            <div className="flex items-start flex-col">
              <span>{row.name}</span>
              {row.value && (
                <small className="text-white/45">= {row.value}</small>
              )}
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                onClick={() =>
                  onOpen({
                    content: <ModalViewFlow id={row.id} />,
                  })
                }
                size={"sm"}
                bg={"#f0f0f016"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
              >
                <LuEye color={"#dbdbdb"} />
              </Button>

              <Button
                onClick={() => {
                  onOpen({
                    content: <ModalEditFlow close={close} id={row.id} />,
                  });
                }}
                size={"sm"}
                bg={"#60d6eb13"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              {/* <ModalDeleteFlow
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#eb606013"}
                    _hover={{ bg: "#eb606028" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <MdDeleteOutline color={"#f75050"} />
                  </Button>
                }
                data={{ id: row.id, name: row.name }}
              /> */}
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
          <h1 className="text-lg font-semibold">Variáveis</h1>
          <ModalCreateFlow
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Variáveis servem para guardar informações personalizadas dos seus
          contatos, como nome, e-mail, etc.
        </p>
      </div>
      <div
        style={{ maxHeight: "calc(100vh - 180px)" }}
        className="flex flex-col"
      >
        <TableComponent
          rows={variables || []}
          columns={renderColumns}
          textEmpity="Nenhuma variável criada."
          load={isFetching || isPending}
        />
      </div>
    </div>
  );
};
