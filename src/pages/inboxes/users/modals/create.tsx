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
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInboxUser } from "../../../../hooks/inboxUser";
import SelectInboxDepartments from "@components/SelectInboxDepartments";

interface IProps {
  onCreate?(business: any): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório.")
    .max(50, "Máximo de 50 caracteres."),
  email: z
    .string({ message: "Campo obrigatório." })
    .email("E-mail inválido.")
    .min(1, "Campo obrigatório.")
    .max(200, "Máximo de 200 caracteres."),
  password: z
    .string({ message: "Campo obrigatório." })
    .min(8, "Senha deve ter pelo menos 8 caracteres."),
  inboxDepartmentId: z.number().optional(),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateUser({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    control,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createInboxUser, isPending } = useCreateInboxUser({
    setError,
    async onSuccess() {
      setOpen(false);
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createInboxUser(fields);
      reset();
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
      unmountOnExit
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"370px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar atendente</DialogTitle>
          <DialogDescription>
            Adicione atendente para atender seus contatos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} mt={"-10px"}>
            <Field
              label="Atribuir departamento"
              helperText={
                <Text>
                  Se nenhum departamento for atribuído, o atendente não poderá
                  acessar a plataforma. Você pode fazer essa atribuição durante
                  a criação ou edição do departamento.
                </Text>
              }
              errorText={errors.inboxDepartmentId?.message}
              invalid={!!errors.inboxDepartmentId}
              className="w-full"
            >
              <Controller
                name="inboxDepartmentId"
                control={control}
                render={({ field }) => (
                  <SelectInboxDepartments
                    name={field.name}
                    isMulti={false}
                    isClearable={false}
                    onBlur={field.onBlur}
                    onChange={(e: any) => {
                      field.onChange(e.value);
                    }}
                    onCreate={(business) => field.onChange(business.id)}
                    value={field.value}
                  />
                )}
              />
            </Field>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome do atendente"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do atendente"
              />
            </Field>
            <Field
              errorText={errors.email?.message}
              invalid={!!errors.email}
              label="E-mail do atendente"
              helperText={"Não enviamos e-mails de confirmação."}
            >
              <Input
                {...register("email")}
                autoComplete="off"
                placeholder="Digite o e-mail do atendente"
              />
            </Field>
            <Field
              errorText={errors.password?.message}
              invalid={!!errors.password}
              label="Senha de acesso"
            >
              <Input
                {...register("password")}
                autoComplete="off"
                placeholder="Digite a senha"
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
