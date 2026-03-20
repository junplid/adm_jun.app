import { Button, Input, Text, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useCallback, JSX, useEffect } from "react";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@components/ui/field";
import { CloseButton } from "@components/ui/close-button";
import {
  useGetInboxUser,
  useUpdateInboxUser,
} from "../../../../hooks/inboxUser";
import SelectInboxDepartments from "@components/SelectInboxDepartments";

interface PropsModalEdit {
  id: number;
  close: () => void;
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
  password: z.string({ message: "Campo obrigatório." }).optional(),
  inboxDepartmentId: z.number().nullish(),
});

type Fields = z.infer<typeof FormSchema>;

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
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    setError,
    getValues,
    control,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateInboxUser, isPending } = useUpdateInboxUser({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetInboxUser(id);

  useEffect(() => {
    if (data) reset(data);
  }, [data]);

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);
      await updateInboxUser({ id, body: changedFields });
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
      <DialogBody as={"div"}>
        <VStack gap={4} mt={"-10px"}>
          <Field
            label="Atribuir departamento"
            helperText={
              <Text>
                Se nenhum departamento for atribuído, o atendente não poderá
                acessar a plataforma. Você pode fazer essa atribuição durante a
                criação ou edição do departamento.
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
            label="Forçar nova senha de acesso"
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
          <Button type="button" disabled={isSubmitting} variant="outline">
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          type="submit"
          colorPalette={"teal"}
          disabled={isFetching || isPending || !isDirty}
          loading={isSubmitting}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export const ModalEditIndexUser: React.FC<PropsModalEdit> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"370px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar atendente</DialogTitle>
        <DialogDescription>Edite informações do atendente</DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
