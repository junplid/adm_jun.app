import { JSX, useContext, useMemo } from "react";
import { TableComponent, TableMobileComponent } from "../../../components/Table";
import { Column } from "../../../components/Table";
import { ModalCreateVariable } from "./modals/create";
import { ModalDeleteVariable } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewVariable } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditVariable } from "./modals/edit";
import { useGetVariables } from "../../../hooks/variable";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { LayoutWorkbenchPageContext } from "../contexts";
import { AuthContext } from "@contexts/auth.context";

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
  const { clientMeta } = useContext(AuthContext);
  const { ToggleMenu } = useContext(LayoutWorkbenchPageContext);
  const { data: variables, isFetching, isPending } = useGetVariables();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "type",
        name: "Tipo",
        styles: { width: 120 },
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
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalViewVariable
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
                    content: <ModalEditVariable close={close} id={row.id} />,
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
                      <ModalDeleteVariable
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
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:flex">{ToggleMenu}</span>
            <h1 className="text-base sm:text-lg font-semibold">Variáveis</h1>
            {/* <p className="text-white/60 font-light">
              guarda informações personalizadas dos seus contatos.
            </p> */}
          </div>
          <ModalCreateVariable
            trigger={
              <Button variant="outline" size={{ sm: "sm", base: "xs" }}>
                <IoAdd /> <span className="sm:block hidden">Adicionar</span>
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex-1 grid">
        {clientMeta.isMobileLike || clientMeta.isSmallScreen ? (
          <TableMobileComponent
            totalCount={(variables || []).length || 0}
            renderItem={(index) => {
              const row = (variables || [])![index];
              return (
                <div className="flex flex-col bg-amber-50/5 p-3! py-2! my-1 rounded-md">
                  <span>{row.name}</span>

                  <div className="flex items-center mt-1 justify-between">
                    <span
                      style={{
                        background: translateType[row.type].cb,
                        color: translateType[row.type].ct,
                      }}
                      className="flex p-0.5 px-2 gap-x-2 text-xs tracking-wide select-none items-center font-light rounded-sm"
                    >
                      {translateType[row.type].label}
                    </span>
                    <div className="flex gap-x-1">
                      <Button
                        onClick={() => {
                          onOpen({
                            content: <ModalEditVariable close={close} id={row.id} />,
                          });
                        }}
                        size={"xs"}
                        bg={"transparent"}
                        _hover={{ bg: "#30c9e422" }}
                        _icon={{ width: "16px", height: "16px" }}
                        disabled={row.type === "system"}
                      >
                        <MdEdit color={"#9ec9fa"} />
                      </Button>
                      <Button
                        size={"xs"}
                        bg={"#cf5c5c24"}
                        _hover={{ bg: "#eb606028" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() => {
                          onOpen({
                            content: (
                              <ModalDeleteVariable
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
                  </div>
                </div>
              );
            }}
            textEmpity="Suas variáveis aparecerão aqui."
            load={isFetching || isPending}
          />
        ) : (
          <TableComponent
            rows={variables || []}
            columns={renderColumns}
            textEmpity="Suas variáveis aparecerão aqui."
            load={isFetching || isPending}
          />
        )}
      </div>
      {DialogModal}
    </div>
  );
};
