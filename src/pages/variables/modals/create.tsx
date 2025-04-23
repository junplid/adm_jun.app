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
import { VariableRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import { useCreateVariable } from "../../../hooks/variable";
import SelectComponent from "@components/Select";

interface IProps {
  onCreate?(business: VariableRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["dynamics", "constant"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()).optional(),
  value: z.string().optional(),
});

type Fields = z.infer<typeof FormSchema>;

const optionsType = [
  { label: "Mutável", value: "dynamics" },
  { label: "Imutável", value: "constant" },
];

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
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createVariable, isPending } = useCreateVariable({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const flow = await createVariable(fields);
      const { businessIds, ...rest } = fields;
      reset();
      props.onCreate?.({ ...flow, ...rest });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const type = watch("type");

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
          <DialogTitle>Criar variável</DialogTitle>
          <DialogDescription>
            Guarde e personalize informações dos seus contatos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              label="Anexe projetos"
              helperText={
                <Text>
                  Se nenhum projeto for selecionado, a variável será anexada a
                  todos os projetos existentes e os que forem criados no futuro.
                </Text>
              }
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
            {type === "constant" && (
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
