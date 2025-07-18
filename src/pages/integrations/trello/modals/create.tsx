import { Button, Input, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React, { JSX, useCallback, useState } from "react";
import { PaymentRow } from "..";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { CloseButton } from "@components/ui/close-button";
import { useCreateTrelloIntegration } from "../../../../hooks/trelloIntegration";

interface Props {
  onCreate?(business: PaymentRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

export const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório" })
    .trim()
    .min(1, { message: "Campo obrigatório" }),
  token: z
    .string({ message: "Campo obrigatório" })
    .trim()
    .min(1, { message: "Campo obrigatório" }),
  key: z
    .string({ message: "Campo obrigatório" })
    .trim()
    .min(1, { message: "Campo obrigatório" }),
  status: z.boolean().optional(),
});

export type Fields = z.infer<typeof FormSchema>;

export const ModalTrello: React.FC<Props> = (props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { status: true },
  });

  const { mutateAsync: createTrello, isPending } = useCreateTrelloIntegration({
    setError,
    async onSuccess() {
      setOpen(false);
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createTrello(fields);
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
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
      size={"sm"}
      closeOnEscape={false}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        w={"390px"}
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar integração do trello</DialogTitle>
          <DialogDescription>
            Centralize e controle suas integrações do trello.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt={"-5px"}>
          <VStack gap={4}>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome da integração"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                placeholder="Digite o nome da integração"
              />
            </Field>
            <Field
              errorText={errors.key?.message}
              invalid={!!errors.key}
              label="Chave de API"
            >
              <Input
                {...register("key")}
                autoComplete="off"
                placeholder="Digite a chave de API"
              />
            </Field>
            <Field
              errorText={errors.token?.message}
              invalid={!!errors.token}
              label="Token de acesso"
            >
              <Input
                {...register("token")}
                autoComplete="off"
                placeholder="Digite o token de acesso"
              />
            </Field>

            <ul className="list-decimal pl-4 flex flex-col gap-2 mt-1">
              <li>
                Acesse:{" "}
                <a
                  href="https://trello.com/power-ups/admin"
                  target="_blank"
                  className="text-blue-300 hover:text-blue-400 hover:underline font-medium"
                >
                  https://trello.com/power-ups/admin
                </a>{" "}
              </li>
              <li>Selecione o seu Power-ups/Integração ou crie um novo.</li>
              <li>Acesse a aba 'Chave de API' no menu lateral esquerdo.</li>
              <li>
                Copie a Chave de API e o Segredo(token de acesso). Gere um novo
                Secredo caso não exista.
              </li>
            </ul>
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
};
