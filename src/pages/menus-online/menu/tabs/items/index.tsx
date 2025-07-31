import { Column, TableComponent } from "@components/Table";
import { useGetVariables } from "../../../../../hooks/variable";
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

export type TypeVariable = "dynamics" | "constant" | "system";

export interface ItemRow {
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
        // render(row) {
        //   const type = row.type as TypeVariable;
        //   return (
        //     <span
        //       style={{
        //         background: translateType[type].cb,
        //         color: translateType[type].ct,
        //       }}
        //       className="flex p-0.5 px-2 gap-x-2 text-sm tracking-wide select-none items-center font-semibold rounded-sm"
        //     >
        //       {translateType[type].label}
        //     </span>
        //   );
        // },
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
        {!![].length && (
          <span className="text-white/50 mt-10 text-center">
            {[].length > 1
              ? `${[].length} pedidos encontrados"`
              : `${[].length} pedido encontrado`}
          </span>
        )}
      </div>
      <TableComponent
        rows={items || []}
        columns={renderColumns}
        textEmpity="Suas variáveis aparecerão aqui."
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

// function ItemCategory() {
//   const [open, setOpen] = useState(false);
//   const [subs, _setSubs] = useState([
//     { name: "Pequena", price: 30, desc1: "1 sabor", desc2: "2 fatias" },
//     { name: "Media", price: 30, desc1: "1 sabor", desc2: "2 fatias" },
//     { name: "Grande", price: 30, desc1: "1 sabor", desc2: "2 fatias" },
//   ]);

//   return (
//     <li className="py-1 flex flex-col w-full">
//       <Collapsible.Root
//         open={open}
//         onOpenChange={(p) => setOpen(p.open)}
//         unmountOnExit
//         lazyMount
//       >
//         <Collapsible.Trigger className="w-full">
//           <div className="flex items-center w-full justify-between gap-x-2">
//             <span className="font-medium">Pizza</span>
//             <div className="flex items-center justify-end">
//               <a className="p-1 cursor-pointer">
//                 {open ? <FaAngleUp size={17} /> : <FaAngleDown size={17} />}
//               </a>
//               <a
//                 onClick={(e) => {
//                   e.stopPropagation();
//                 }}
//                 className="hover:bg-[#30d5e422] p-1 rounded-sm duration-200 cursor-pointer ml-1.5"
//               >
//                 <FaRegSave size={16} color={"#9edbfa"} />
//               </a>
//               <a
//                 onClick={(e) => {
//                   e.stopPropagation();
//                 }}
//                 className="hover:bg-[#eb606028] p-1 rounded-sm duration-200 cursor-pointer"
//               >
//                 <MdDeleteOutline size={18} color={"#f75050"} />
//               </a>
//             </div>
//           </div>
//         </Collapsible.Trigger>
//         <Collapsible.Content
//           className={clsx(
//             "flex flex-col gap-y-2 p-1 px-2 pb-2",
//             open && "bg-zinc-500/5"
//           )}
//         >
//           <div className="flex justify-between gap-x-2 items-center">
//             <Editable.Root
//               textAlign="start"
//               onClick={(e) => {
//                 e.stopPropagation();
//               }}
//               defaultValue="Pizza"
//               size={"sm"}
//             >
//               <Editable.Preview />
//               <Editable.Input outline={"none"} />
//             </Editable.Root>
//             <span className="w-[40px] h-[40px] bg-zinc-600 block" />
//           </div>
//           <div className="flex flex-col gap-y-1">
//             <ul className="grid grid-cols-2 gap-0.5 gap-y-2">
//               {subs.map((s) => (
//                 <li
//                   key={s.name}
//                   className="flex flex-col items-center text-sm text-center"
//                 >
//                   <strong>{s.name}</strong>
//                   <span className="font-medium">{formatToBRL(s.price)}</span>
//                   <span>{s.desc1}</span>
//                   <span>{s.desc2}</span>
//                   <a
//                     onClick={(e) => {
//                       e.stopPropagation();
//                     }}
//                     className="hover:bg-[#eb606028] p-1 flex justify-center rounded-sm duration-200 cursor-pointer"
//                   >
//                     <MdDeleteOutline size={18} color={"#f75050"} />
//                   </a>
//                 </li>
//               ))}
//             </ul>
//             <button className="p-1 text-sm border border-zinc-800 hover:bg-zinc-900 cursor-pointer rounded-sm mx-2">
//               Adicionar subcategoria
//             </button>
//           </div>
//         </Collapsible.Content>
//       </Collapsible.Root>
//     </li>
//   );
// }

export const TabProducts = memo(TabProducts_);
