import { useDialogModal } from "../../../../../hooks/dialog.modal";
import { JSX, memo, useCallback, useState } from "react";
import { Field } from "@components/ui/field";
import { Button, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHookFormMask } from "use-mask-input";
import { AxiosError } from "axios";
import { useCreateMenuOnlineSizePizza } from "../../../../../hooks/menu-online";

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

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  price: z.string().min(1, "Campo obrigatório."),
  flavors: z
    .number({ message: "Campo obrigatório." })
    .min(0, "Valor minimo é 0"),
  slices: z.number().optional(),
});

type Fields = z.infer<typeof FormSchema>;

function SizePizzaComponent({ uuid }: { uuid: string }) {
  const [isCreate, setIsCreate] = useState(false);
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const registerWithMask = useHookFormMask(register);
  const { mutateAsync: createSize, isPending } = useCreateMenuOnlineSizePizza({
    setError,
  });

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await createSize({
          ...fields,
          price: Number(fields.price),
          menuUuid: uuid,
        });
        reset();
        setIsCreate(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [uuid]
  );

  return (
    <div className="px-3 pt-4 bg-zinc-800/15 flex flex-col gap-y-3 rounded-md">
      <div className="flex flex-col gap-y-4 items-center justify-between">
        <span className="block font-medium">Tamanhos de pizzas</span>
        {!isCreate && (
          <button onClick={() => setIsCreate(true)} className="text-green-300">
            Adicionar
          </button>
        )}
      </div>
      <div>lista</div>
      {isCreate && (
        <form
          onSubmit={handleSubmit(create)}
          className="flex flex-col gap-x-1.5"
        >
          <div className="flex gap-x-2">
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome do tamanho"
            >
              <Input
                autoComplete="off"
                {...register("name")}
                placeholder="Digite o nome"
              />
            </Field>
            <Field
              errorText={errors.price?.message}
              invalid={!!errors.price}
              label="Preço"
            >
              <Input
                autoComplete="off"
                placeholder="Digite o valor"
                {...registerWithMask("price", [
                  "9",
                  "99",
                  "9.99",
                  "99.99",
                  "999.99",
                ])}
              />
            </Field>
          </div>
          <div className="flex gap-x-2">
            <Field
              errorText={errors.flavors?.message}
              invalid={!!errors.flavors}
              label="Sabores"
            >
              <Input
                type="number"
                {...register("flavors", { valueAsNumber: true })}
              />
            </Field>
            <Field
              errorText={errors.slices?.message}
              invalid={!!errors.slices}
              label="Fatias"
            >
              <Input
                type="number"
                {...register("slices", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="flex gap-x-1.5">
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
            <Button type="submit" loading={isPending}>
              Criar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

const TabConfig_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const {
    dialog: DialogModal,
    close: _close,
    onOpen: _onOpen,
  } = useDialogModal({});

  return (
    <div className="flex-1 !pt-0 grid grid-cols-[210px_1fr] gap-x-2 h-full">
      <SizePizzaComponent uuid={uuid} />
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

export const TabConfig = memo(TabConfig_);
