import { useDialogModal } from "../../../../../hooks/dialog.modal";
import {
  JSX,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Field } from "@components/ui/field";
import { Button, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHookFormMask } from "use-mask-input";
import { AxiosError } from "axios";
import {
  useCreateMenuOnlineSizePizza,
  useGetMenuOnline,
  useUpdateMenuOnline,
} from "../../../../../hooks/menu-online";
import TextareaAutosize from "react-textarea-autosize";
import { MdOutlineImage } from "react-icons/md";
import { Avatar } from "@components/ui/avatar";
import { api } from "../../../../../services/api";

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
    [uuid],
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

const FormSchemaConfig = z.object({
  identifier: z.string().optional(),
  desc: z.string().optional(),
  titlePage: z.string().optional(),
  img: z.instanceof(File).optional(),
  bg_primary: z.string().optional(),
  bg_secondary: z.string().optional(),
  bg_tertiary: z.string().optional(),
  label1: z.string().optional(),
  label: z.string().optional(),
  status: z.boolean().optional(),
});

type ConfigFields = z.infer<typeof FormSchemaConfig>;

function FormConfigComponent({ uuid }: { uuid: string }) {
  const { data, isError, isFetching, isLoading } = useGetMenuOnline({ uuid });
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty, dirtyFields },
    reset,
    watch,
    getValues,
    setError,
    setValue,
  } = useForm<ConfigFields>({
    resolver: zodResolver(FormSchemaConfig),
  });
  const { mutateAsync: updateMenu, isPending } = useUpdateMenuOnline({
    setError,
  });
  const edit = useCallback(async (): Promise<void> => {
    if (!data?.id) return;
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<ConfigFields>);
      await updateMenu({ id: data.id, body: changedFields });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [dirtyFields]);

  useEffect(() => {
    if (data) reset({ ...data, bg_primary: "#111111" });
  }, [data]);

  const fileImage = watch("img");
  const bg_primary = watch("bg_primary");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) return URL.createObjectURL(fileImage);
    if (data?.logoImg) return api.getUri() + `/public/storage/${data?.logoImg}`;
  }, [fileImage, data?.logoImg]);

  return (
    <form
      onSubmit={handleSubmit(edit)}
      className="flex flex-col gap-y-2 px-1.5 pb-2 overflow-y-scroll pr-2 h-[calc(100svh-250px)]"
    >
      <Field
        errorText={errors.titlePage?.message}
        invalid={!!errors.titlePage}
        label="Título da página"
        disabled={isFetching || isLoading || isError}
      >
        <Input {...register("titlePage")} autoComplete="off" />
      </Field>
      <div className="flex items-center w-full gap-x-2">
        <div
          className="relative cursor-pointer border-2 p-0.5"
          onClick={() => imgProfileRef.current?.click()}
          style={{
            borderColor: !!errors.img ? "#e77171" : "transparent",
          }}
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
            bg={imgPreviewUrl ? bg_primary || "#fff" : "#ffffff2c"}
            size={"2xl"}
            width={"60px"}
            height={"60px"}
            src={imgPreviewUrl}
            icon={<MdOutlineImage />}
            rounded={"none"}
          />
        </div>
        <Field
          errorText={errors.identifier?.message}
          invalid={!!errors.identifier}
          label="Identificador único"
          disabled={isFetching || isLoading || isError}
        >
          <Input
            {...register("identifier")}
            autoComplete="off"
            placeholder="Digite o identificador do cardápio"
          />
        </Field>
      </div>

      <Field
        errorText={errors.desc?.message}
        invalid={!!errors.desc}
        label="Descrição"
        disabled={isFetching || isLoading || isError}
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

      <div className="flex items-center w-full gap-x-2">
        <Field
          errorText={errors.bg_primary?.message}
          invalid={!!errors.bg_primary}
          label="Cor primária"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("bg_primary")} type="color" autoComplete="off" />
        </Field>
        <Field
          errorText={errors.bg_secondary?.message}
          invalid={!!errors.bg_secondary}
          label="Cor secundária"
          disabled
        >
          <Input {...register("bg_secondary")} autoComplete="off" />
        </Field>
        <Field
          errorText={errors.bg_tertiary?.message}
          invalid={!!errors.bg_tertiary}
          label="Cor terciária"
          disabled
        >
          <Input {...register("bg_tertiary")} autoComplete="off" />
        </Field>
      </div>

      <div className="flex gap-x-1.5 ml-auto mt-3">
        <Button
          type="button"
          disabled={isPending || !isDirty}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          Atualizar
        </Button>
      </div>
    </form>
  );
}

const TabConfig_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const {
    dialog: DialogModal,
    close: _close,
    onOpen: _onOpen,
  } = useDialogModal({});

  return (
    <div className="flex-1 !pt-0 grid grid-cols-[1fr_270px] gap-x-2 h-full">
      <FormConfigComponent uuid={uuid} />
      <SizePizzaComponent uuid={uuid} />
      {DialogModal}
    </div>
  );
};

export const TabConfig = memo(TabConfig_);
