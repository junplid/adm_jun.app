import { useCallback, useContext, useEffect, useState } from "react";
import { Field } from "@components/ui/field";
import { AspectRatio, Button, Input } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import {
  getMenuOnlineCategory,
  updateMenuOnlineCategory,
} from "../../../../../../services/api/MenuOnline";
import { useParams } from "react-router-dom";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import SelectComponent from "@components/Select";
import { toaster } from "@components/ui/toaster";
import { api } from "../../../../../../services/api";

const FormSchema = z.object({
  name: z.string().min(1, { message: "Campo obrigatório." }),
  fileImage: z.instanceof(File, { message: "Campo obrigatório." }).nullish(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  days_in_the_week: z.array(z.number()).optional(),
});

type Fields = z.infer<typeof FormSchema>;

interface Props {
  bg_primary?: string;
  catUuid: string;
  cancel(): void;
  onEdit(p: {
    uuid: string;
    name?: string;
    image45x45png?: string;
    days_in_the_week_label: string;
  }): void;
}

const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

export function FormEditCategoryMenuOnlineConfig(props: Props) {
  const { logout } = useContext(AuthContext);
  const { uuid } = useParams<{ uuid: string }>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
    setError,
    setValue,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    (async () => {
      if (!uuid) return;
      try {
        const category = await getMenuOnlineCategory({
          uuid,
          catUuid: props.catUuid,
        });
        reset({
          days_in_the_week: category.days_in_the_week || [],
          name: category.name,
        });
        if (category.image45x45png) {
          setPreviewImage(category.image45x45png);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    })();
  }, [uuid]);

  const update = useCallback(
    async (fields: Fields): Promise<void> => {
      if (!uuid) return;
      setLoading(true);
      try {
        const category = await updateMenuOnlineCategory(
          uuid,
          props.catUuid,
          fields,
        );
        props.onEdit({
          ...category,
          uuid: props.catUuid,
          name: fields.name,
        });
        reset();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast?.length)
              dataError.toast.forEach(toaster.create);
            if (dataError.input?.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    },
    [uuid],
  );

  console.log(errors);

  return (
    <div className="flex flex-col">
      <span>Atualizar categoria</span>
      <form
        onSubmit={handleSubmit(update)}
        className="flex space-y-2 flex-wrap gap-2 p-3 bg-neutral-200/2"
      >
        <div
          className={
            previewImage ? "grid gap-x-2 grid-cols-[45px_1fr]" : undefined
          }
        >
          {previewImage && (
            <div
              className="flex flex-col"
              onClick={() => {
                setValue("fileImage", null, { shouldDirty: true });
                setPreviewImage(null);
              }}
            >
              <AspectRatio ratio={1} w={"100%"}>
                <div
                  className={`rounded-xl w-full p-0.5 flex justify-center duration-300 items-center`}
                >
                  <img
                    src={`${api.getUri()}/public/images/${previewImage}`}
                    className="w-full h-auto "
                  />
                </div>
              </AspectRatio>
              <span className="text-[11px] text-red-400 font-medium text-center">
                Remover
              </span>
            </div>
          )}
          <Field
            label="Nova foto 45x45"
            required
            invalid={!!errors.fileImage}
            errorText={errors.fileImage?.message}
          >
            <input
              className="bg-neutral-500/10 p-2 max-w-48"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setValue("fileImage", file, { shouldDirty: true });
              }}
            />
          </Field>
        </div>
        <Field
          label="Nome"
          required
          invalid={!!errors.name}
          errorText={errors.name?.message}
        >
          <Input {...register("name")} size={"sm"} />
        </Field>
        <Field
          invalid={!!errors.days_in_the_week}
          errorText={errors.days_in_the_week?.message}
          label="Dias da semana recorrente"
        >
          <Controller
            control={control}
            name="days_in_the_week"
            render={({ field }) => {
              return (
                <SelectComponent
                  isMulti
                  onBlur={() => {}}
                  name={field.name}
                  isDisabled={field.disabled}
                  isSearchable={false}
                  isClearable
                  ref={field.ref}
                  placeholder=""
                  onChange={(e: any) => {
                    // setValue("startAt", undefined, { shouldDirty: true });
                    // setValue("endAt", undefined, { shouldDirty: true });
                    field.onChange(e.map((s: any) => s.value));
                  }}
                  options={optionsOpertaingDays}
                  value={(field.value || [])?.map((s) => ({
                    value: s,
                    label:
                      optionsOpertaingDays.find((d) => d.value === s)?.label ||
                      "",
                  }))}
                />
              );
            }}
          />
        </Field>
        <div className="flex mt-3 gap-x-2 justify-end w-full">
          <Button
            type="button"
            onClick={props.cancel}
            colorPalette={"red"}
            size={"sm"}
          >
            Cancelar
          </Button>
          <Button
            colorPalette={"teal"}
            size={"sm"}
            type="submit"
            disabled={!isDirty}
            loading={loading}
          >
            Atualizar
          </Button>
        </div>
      </form>
    </div>
  );
}
