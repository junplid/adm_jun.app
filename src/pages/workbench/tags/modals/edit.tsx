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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import SelectBusinesses from "@components/SelectBusinesses";
import deepEqual from "fast-deep-equal";
import { useGetTag, useUpdateTag } from "../../../../hooks/tag";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["contactwa", "audience"], { message: "Campo obrigatório." }),
  businessIds: z.array(z.number()).optional(),
});

type Fields = z.infer<typeof FormSchema>;

// const optionsType = [
//   { label: "Lead", value: "contact" },
//   { label: "Público", value: "audience" },
// ];

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
    // control,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateTag, isPending } = useUpdateTag({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetTag(id);

  useEffect(() => {
    if (data) {
      setFieldsDraft({
        name: data.name,
        type: data.type,
        businessIds: data.businessIds,
      });
      setValue("name", data.name);
      setValue("type", data.type);
      setValue("businessIds", data.businessIds);
    }
  }, [data]);

  const edit = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await updateTag({ id, body: fields });
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
                Se nenhum projeto for selecionado, a etiqueta será anexada a
                todos os projetos existentes e os que forem criados no futuro.
              </Text>
            }
            errorText={errors.businessIds?.message}
            invalid={!!errors.businessIds}
            className="w-full"
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
                  onCreate={(business) => {
                    setValue("businessIds", [
                      ...(getValues("businessIds") || []),
                      business.id,
                    ]);
                  }}
                  setError={({ name, message }) => {
                    if (name === "name") {
                      setError("businessIds", { message });
                    }
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
              autoFocus
              autoComplete="off"
              placeholder="Digite o nome da etiqueta"
            />
          </Field>
          {/* <Field
              label="Tipo da etiqueta"
              errorText={errors.type?.message}
              invalid={!!errors.type}
              helperText="Variaveis imutáveis não podem ser alteradas em construtores de fluxos."
              className="w-full"
              hidden
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
            </Field> */}
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

export function ModalEditTag({ id, ...props }: IProps): JSX.Element {
  return (
    <DialogContent w={"348px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar etiqueta</DialogTitle>
        <DialogDescription>O limite é a sua imaginação.</DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
