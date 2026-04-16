import { useCallback, useContext } from "react";
import { Field } from "@components/ui/field";
import { Button, Input } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { createMenuOnlineCategory } from "../../../../../../services/api/MenuOnline";
import { useParams } from "react-router-dom";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import SelectComponent from "@components/Select";
import { toaster } from "@components/ui/toaster";
import { Category } from ".";

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
  cancel(): void;
  onCreate(p: Category): void;
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

export function FormCreateCategoriesMenuOnlineConfig(props: Props) {
  const { logout } = useContext(AuthContext);
  const { uuid } = useParams<{ uuid: string }>();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setError,
    setValue,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { fileImage: null },
  });

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      if (!uuid) return;
      try {
        const category = await createMenuOnlineCategory(uuid, fields);
        props.onCreate({ ...category, items: 0, name: fields.name });
        reset();
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
    },
    [uuid],
  );

  return (
    <div className="flex flex-col">
      <span>Adicionar categoria</span>
      <form
        onSubmit={handleSubmit(create)}
        className="flex space-y-2 flex-wrap gap-2 p-3 bg-neutral-200/2"
      >
        <Field
          label="Imagem 45x45"
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
              setValue("fileImage", file);
            }}
          />
        </Field>
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
                    setValue("startAt", undefined);
                    setValue("endAt", undefined);
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
          <Button colorPalette={"green"} size={"sm"} type="submit">
            Adicionar
          </Button>
        </div>
      </form>
    </div>
  );
}
