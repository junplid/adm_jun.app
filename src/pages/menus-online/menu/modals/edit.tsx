import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, VStack } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import SelectBusinesses from "@components/SelectBusinesses";
import deepEqual from "fast-deep-equal";
import { useGetVariable, useUpdateVariable } from "../../../../hooks/variable";
import SelectComponent from "@components/Select";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["dynamics", "constant"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()).optional(),
  value: z.string().optional().nullable(),
});

type Fields = z.infer<typeof FormSchema>;

const optionsType = [
  { label: "Mutável", value: "dynamics" },
  { label: "Imutável", value: "constant" },
];

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const [fieldsDraft, setFieldsDraft] = useState<Fields | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    // getValues,
    control,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateVariable, isPending } = useUpdateVariable({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetVariable(id);

  useEffect(() => {
    if (data) {
      setFieldsDraft({
        name: data.name,
        type: data.type,
        value: data.value,
        businessIds: data.businessIds,
      });
      setValue("name", data.name);
      setValue("value", data.value);
      setValue("type", data.type);
      setValue("businessIds", data.businessIds);
    }
  }, [data]);

  const edit = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await updateVariable({ id, body: fields });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [fieldsDraft]
  );

  const fields = watch();
  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsDraft, fields);
  }, [fields, fieldsDraft]);

  return (
    <form onSubmit={handleSubmit(edit)}>
      <DialogBody>
        <VStack gap={4}>
          {/* <Field
            label="Anexe projetos"
            helperText={
              <Text>
                Se nenhum projeto for selecionado, a variável será anexada a
                todos os projetos existentes e os que forem criados no futuro.
              </Text>
            }
            className="w-full"
            errorText={errors.businessIds?.message}
            invalid={!!errors.businessIds}
          >
            <Controller
              name="businessIds"
              control={control}
              render={({ field }) => (
                <SelectBusinesses
                  name={field.name}
                  isMulti
                  onBlur={field.onBlur}
                  onChange={(e: any) => {
                    field.onChange(e.map((item: any) => item.value));
                  }}
                  setError={({ name, message }) => {
                    if (name === "name") {
                      setError("businessIds", { message });
                    }
                  }}
                  onCreate={(business) => {
                    setValue("businessIds", [
                      ...(getValues("businessIds") || []),
                      business.id,
                    ]);
                  }}
                  value={field.value}
                />
              )}
            />
          </Field> */}
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Nome"
          >
            <Input
              {...register("name", {
                onChange(event) {
                  setValue(
                    "name",
                    event.target.value.replace(/\s/g, "_")
                    // .replace(/[^a-zA-Z0-9-.-ç_]/g, "")
                  );
                },
              })}
              autoComplete="off"
              placeholder="Digite o nome da variável"
            />
          </Field>
          <Field
            label="Tipo da variável"
            errorText={errors.type?.message}
            invalid={!!errors.type}
            helperText="Variaveis imutáveis não podem ser alteradas em construtores de fluxos."
            className="w-full"
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(e: any) => {
                    if (e?.value) {
                      field.onChange(e.value);
                    } else {
                      field.onChange(null);
                    }
                  }}
                  options={optionsType}
                  isClearable
                  value={
                    field.value
                      ? [
                          {
                            label:
                              optionsType.find(
                                (item) => item.value === field.value
                              )?.label || "",
                            value: field.value,
                          },
                        ]
                      : null
                  }
                  placeholder="Selecione o tipo da variável"
                />
              )}
            />
          </Field>
          {fields.type === "constant" && (
            <Field
              errorText={errors.value?.message}
              invalid={!!errors.value}
              label="Valor"
            >
              <Input
                {...register("value")}
                autoComplete="off"
                placeholder="Digite o valor da variável"
              />
            </Field>
          )}
        </VStack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" disabled={isSubmitting} variant="outline">
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          type="submit"
          colorPalette={"teal"}
          disabled={isFetching || isPending || !isSave}
          loading={isSubmitting}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModalEditVariable({ id, ...props }: IProps): JSX.Element {
  return (
    <DialogContent w={"348px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar variável</DialogTitle>
        <DialogDescription>
          Guarde e personalize informações dos seus contatos.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
