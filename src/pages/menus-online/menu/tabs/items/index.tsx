import { Column, TableComponent } from "@components/Table";
import { useDialogModal } from "../../../../../hooks/dialog.modal";
import { JSX, memo, useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { ModalEditVariable } from "./modals/edit";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalDeleteVariable } from "./modals/delete";
import { Field } from "@components/ui/field";
import SelectComponent from "@components/Select";
import { ModalCreateProduct } from "./modals/create";
import { IoAdd } from "react-icons/io5";
import { useGetMenuOnlineItems } from "../../../../../hooks/menu-online";

export type TypeCategory = "pizzas" | "drinks";

export interface ItemRow {
  uuid: string;
  id: number;
  name: string;
  desc: string | null;
  category: "pizzas" | "drinks";
  qnt: number;
  beforePrice: number | null;
  afterPrice: number;
}

const translateType: {
  [x in TypeCategory]: { label: string; cb: string; ct: string };
} = {
  pizzas: { label: "Pizza", cb: "#836e21", ct: "#dcf4ff" },
  drinks: { label: "Bebida", cb: "#294d6e", ct: "#fff" },
};

const TabProducts_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const {
    data: items,
    isFetching,
    isPending,
  } = useGetMenuOnlineItems({ uuid });
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome",
        render(row) {
          return (
            <span
              title={row.name}
              className="text-blue-200 underline cursor-pointer"
            >
              {row.name}
            </span>
          );
        },
      },
      {
        key: "category",
        name: "Categoria",
        styles: { width: 100 },
        render(row) {
          const category = row.category as TypeCategory;
          return (
            <div className="flex">
              <span
                style={{
                  background: translateType[category].cb,
                  color: translateType[category].ct,
                }}
                className="flex p-0.5 px-2 text-sm text-center select-none font-semibold rounded-sm"
              >
                {translateType[category].label}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 2 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              {/* <Button
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
              </Button> */}
              <Button
                onClick={() => {
                  onOpen({
                    content: <ModalEditVariable close={close} id={row.id} />,
                  });
                }}
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                title={row.name}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                title={row.name}
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
    <div className="flex-1 !pt-0 grid grid-cols-[210px_1fr] gap-x-2 h-full">
      <div className="px-3 pt-4 bg-zinc-800/15 flex flex-col gap-y-3 rounded-md">
        <div className="flex flex-col gap-y-4 items-center justify-between">
          <ModalCreateProduct
            menuUuid={uuid}
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar item
              </Button>
            }
          />
          <span className="block font-medium">Filtrar</span>
        </div>
        <Field label={"Status do pedido"}>
          <SelectComponent
            options={[]}
            placeholder="Todos"
            // value={
            //     filter.status
            //     ? {
            //         label:
            //             optionsStatus.find((s) => s.value === filter.status)
            //             ?.label || "",
            //         value: filter.status,
            //         }
            //     : null
            // }
            // onChange={(vl: any) => {
            //     if (!vl) {
            //     setFilter({ ...filter, status: undefined });
            //     return;
            //     }
            //     setFilter({ ...filter, status: vl.value });
            // }}
          />
        </Field>
        <Field label={"Prioridade"}>
          <SelectComponent
            options={[]}
            placeholder="Todas"
            // value={
            //     filter.priority
            //     ? {
            //         label:
            //             optionsPriority.find((s) => s.value === filter.priority)
            //             ?.label || "",
            //         value: filter.priority,
            //         }
            //     : null
            // }
            // onChange={(vl: any) => {
            //     if (!vl) {
            //     setFilter({ ...filter, priority: undefined });
            //     return;
            //     }
            //     setFilter({ ...filter, priority: vl.value });
            // }}
          />
        </Field>
        {!!items?.length && (
          <span className="text-white/50 mt-10 text-center">
            {items.length > 1
              ? `${[].length} pedidos encontrados*`
              : `${[].length} pedido encontrado*`}
          </span>
        )}
      </div>
      <TableComponent
        rows={items || []}
        columns={renderColumns}
        textEmpity="Seus items aparecerão aqui."
        load={isFetching || isPending}
      />
      {/* <div className="px-3 pt-4 bg-zinc-800/15 flex flex-col gap-y-3 rounded-md">
        <div className="flex items-center justify-between">
          <span className="block font-medium">Categorias</span>
          <ModalCreateProduct
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <div className="relative h-full">
          <GridWithShadows
            items={[1, 2]}
            listClassName="grid w-full pr-1.5 grid-cols-1 !relative justify-start"
            renderItem={() => <ItemCategory />}
          />
        </div>
      </div> */}
      {DialogModal}
    </div>
  );
};

export const TabProducts = memo(TabProducts_);
