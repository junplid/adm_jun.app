import { JSX, useCallback, useContext, useState } from "react";
import { Button, Input } from "@chakra-ui/react";
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
} from "@components/ui/dialog";
import { AuthContext } from "@contexts/auth.context";
import { Table } from "..";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTable } from "../../../services/api/Tables";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

interface IProps {
  trigger: JSX.Element;
  onCreate: (table: Table) => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateTable({ ...props }: IProps): JSX.Element {
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      setLoad(true);
      const table = await createTable(fields.name);
      reset();
      props.onCreate?.({
        ...table,
        order: null,
        name: fields.name,
        status: "AVAILABLE",
      });
      setOpen(false);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast?.length) dataError.toast.forEach(toaster.create);
          if (dataError.input?.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError?.(path, { message: text }),
            );
          }
        }
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
        <DialogHeader flexDirection={"column"} pt={3} pl={4} gap={0}>
          <DialogTitle>Adicionar mesa</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Nome"
          >
            <Input
              {...register("name")}
              autoFocus
              autoComplete="off"
              placeholder="Digite o nome da mesa"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={load}>
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
