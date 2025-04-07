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
import { FlowRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import { useCreateFlow } from "../../../hooks/flow";
import { useNavigate } from "react-router-dom";

interface IProps {
  onCreate?(business: FlowRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["marketing", "chatbot", "universal"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()).optional(),
});

type Fields = z.infer<typeof FormSchema>;

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
    defaultValues: { type: "chatbot" },
  });

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { mutateAsync: createFlow, isPending } = useCreateFlow({
    setError,
    async onSuccess(id) {
      navigate(`/auth/flows/${id}`);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const flow = await createFlow(fields);
      const { name } = fields;
      reset();
      props.onCreate?.({ ...flow, name, type: fields.type });
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
      placement={placement}
      motionPreset="slide-in-bottom"
      lazyMount
      unmountOnExit
      scrollBehavior={"outside"}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"348px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar construtor de fluxo</DialogTitle>
          <DialogDescription>
            Imagine e construa fluxos de conversa de forma visual e intuitiva.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do construtor"
              />
            </Field>
            <Field
              label="Anexe empresas"
              helperText={
                <Text>
                  Se nenhuma empresa for selecionada, o construtor será anexado
                  a todas as empresas existentes e as que forem criadas no
                  futuro.
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
