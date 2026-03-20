import { Button, Input, VStack } from "@chakra-ui/react";
import { JSX, useCallback, useEffect } from "react";
import { AxiosError } from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { CloseButton } from "@components/ui/close-button";
import {
  useGetTrelloIntegration,
  useUpdateTrelloIntegration,
} from "../../../../hooks/trelloIntegration";

interface Props {
  id: number;
  close: () => void;
}

export const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório." })
    .trim()
    .min(1, { message: "Campo obrigatório." }),
  token: z.string().optional(),
  key: z.string().optional(),
  status: z.boolean().optional(),
});

export type Fields = z.infer<typeof FormSchema>;

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
    setError,
    reset,
    watch,
    getValues,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { status: true },
  });

  const { data } = useGetTrelloIntegration(id);
  const key = watch("key");

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const { mutateAsync: updateTrello, isPending } = useUpdateTrelloIntegration({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);
      await updateTrello({ id, body: changedFields });
      reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [dirtyFields]);

  return (
    <form onSubmit={handleSubmit(edit)}>
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
            helperText={
              !key ? (
                "Link para a recuperação do Token de acesso fica disponivel quando preenche o campo Chave de API"
              ) : (
                <span>
                  Acesse:{" "}
                  <a
                    href={`https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&key=${key}`}
                    className="text-blue-300 hover:text-blue-400 hover:underline font-medium"
                  >
                    Gerar token de acesso
                  </a>
                  , com o token copiado, cole-o no campo acima.
                </span>
              )
            }
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
            <li>Copie a Chave de API.</li>
          </ul>
        </VStack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" disabled={isPending} variant="outline">
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          type="submit"
          loading={isPending}
          disabled={isPending || isSubmitting || !isDirty}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModalEditTrello(props: Props): JSX.Element {
  return (
    <DialogContent w={"390px"} backdrop>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar integração do trello</DialogTitle>
        <DialogDescription>
          Centralize e controle suas integrações do trello.
        </DialogDescription>
      </DialogHeader>
      <Content id={props.id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
