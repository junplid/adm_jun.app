import { JSX, useCallback, useState } from "react";
import { Button, Input, Text, VStack } from "@chakra-ui/react";
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
import { TagRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import { useCreateTag } from "../../../hooks/tag";

interface IProps {
  onCreate?(business: TagRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
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

export function ModalCreateFlow({
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
    getValues,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { type: "contactwa" },
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createTag, isPending } = useCreateTag({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const tag = await createTag(fields);
      const { businessIds, ...rest } = fields;
      reset();
      props.onCreate?.({ ...tag, ...rest, records: 0 });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

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
          <DialogTitle>Criar etiqueta</DialogTitle>
          <DialogDescription>O limite é a sua imaginação.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
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
            </Field>
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
