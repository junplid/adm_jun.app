import { JSX, useCallback, useMemo, useRef, useState } from "react";
import { Button, Input, VStack } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { Order } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectComponent from "@components/Select";
import TextareaAutosize from "react-textarea-autosize";
import { useHookFormMask } from "use-mask-input";
import { Avatar } from "@components/ui/avatar";
import { MdOutlineImage } from "react-icons/md";
import { useCreateMenuOnlineItem } from "../../../../../../hooks/menu-online";

interface IProps {
  onCreate?(business: Order): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  menuUuid: string;
}

const optionsCategory = [
  { label: "Pizzas", value: "pizzas" },
  { label: "Bebidas", value: "drinks" },
];

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  desc: z.string().optional(),
  category: z.enum(["pizzas", "drinks"], { message: "Campo obrigatório." }),
  beforePrice: z.string().optional(),
  afterPrice: z.string().optional(),
  img: z.instanceof(File, { message: "Campo obrigatório." }),
  qnt: z.number().optional(),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateProduct({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const registerWithMask = useHookFormMask(register);
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const { mutateAsync: createItem, isPending } = useCreateMenuOnlineItem({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await createItem({
          ...fields,
          afterPrice: fields.afterPrice ? Number(fields.afterPrice) : undefined,
          beforePrice: fields.beforePrice
            ? Number(fields.beforePrice)
            : undefined,
          menuUuid: props.menuUuid,
        });
        reset();
        // const { businessIds, ...rest } = fields;
        // props.onCreate?.({ ...flow, ...rest });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [props.menuUuid],
  );

  const fileImage = watch("img");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
  }, [fileImage]);

  const category = watch("category");

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
        w={"348px"}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar item</DialogTitle>
          <DialogDescription>
            Guarde e personalize informações dos seus contatos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <div className="flex items-center w-full gap-x-4">
              <div
                className="relative cursor-pointer"
                onClick={() => imgProfileRef.current?.click()}
              >
                <input
                  type="file"
                  ref={imgProfileRef}
                  hidden
                  className="hidden"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("img", file);
                  }}
                />
                <Avatar
                  bg={imgPreviewUrl ? "#fff" : "#ffffff2c"}
                  size={"2xl"}
                  width={"60px"}
                  height={"60px"}
                  src={imgPreviewUrl}
                  icon={<MdOutlineImage />}
                  rounded={"none"}
                />
              </div>
              <Field
                errorText={errors.name?.message}
                invalid={!!errors.name}
                label="Nome"
              >
                <Input
                  {...register("name")}
                  autoFocus
                  autoComplete="off"
                  placeholder="Digite o nome do produto"
                />
              </Field>
            </div>
            <Field
              errorText={errors.desc?.message}
              invalid={!!errors.desc}
              label="Descrição"
            >
              <TextareaAutosize
                placeholder=""
                style={{ resize: "none" }}
                minRows={1}
                maxRows={2}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                {...register("desc")}
              />
            </Field>
            <Field label={"Categoria"}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={optionsCategory}
                    value={
                      field.value
                        ? {
                            label:
                              optionsCategory.find(
                                (s) => s.value === field.value,
                              )?.label || "",
                            value: field.value,
                          }
                        : null
                    }
                    placeholder="Selecione uma categoria"
                    isClearable={false}
                    isSearchable={false}
                    isMulti={false}
                    onChange={(vl: any) => field.onChange(vl.value)}
                  />
                )}
              />
            </Field>
            <div className="grid grid-cols-2 gap-x-2">
              <Field
                errorText={errors.beforePrice?.message}
                invalid={!!errors.beforePrice}
                label="Preço antigo"
                disabled={category === "pizzas"}
              >
                <Input
                  {...registerWithMask("beforePrice", [
                    "9.99",
                    "99.99",
                    "999.99",
                  ])}
                  autoComplete="off"
                  placeholder=""
                />
              </Field>
              <Field
                errorText={errors.afterPrice?.message}
                invalid={!!errors.afterPrice}
                label="Preço atual"
                disabled={category === "pizzas"}
              >
                <Input
                  {...registerWithMask("afterPrice", [
                    "9.99",
                    "99.99",
                    "999.99",
                  ])}
                  autoComplete="off"
                  placeholder="00.00"
                />
              </Field>
            </div>
            <Field
              errorText={errors.qnt?.message}
              invalid={!!errors.qnt}
              label="Quantidade em estoque"
              required
            >
              <Input
                {...registerWithMask("qnt", ["9", "99", "999", "9999"], {
                  valueAsNumber: true,
                })}
                autoComplete="off"
                placeholder="0"
              />
            </Field>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isPending}>
            Criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
