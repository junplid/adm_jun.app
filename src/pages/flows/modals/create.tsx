import { JSX, useCallback, useContext, useState } from "react";
import { Button, Input, Mark, Text, VStack } from "@chakra-ui/react";
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
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toaster } from "@components/ui/toaster";
import { AuthContext } from "@contexts/auth.context";
import { createFlow } from "../../../services/api/Flows";
import SelectBusinesses from "@components/SelectBusinesses";

interface IProps {
  onCreate(business: FlowRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["marketing", "chatbot", "universal"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateBusiness({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { logout } = useContext(AuthContext);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "chatbot",
    },
  });

  const [open, setOpen] = useState(false);

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const flow = await createFlow(fields);
      const { name } = fields;
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
      reset();
      props.onCreate({ ...flow, name, type: fields.type });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError(path, { message: text })
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
      placement={placement}
      motionPreset="slide-in-bottom"
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"470px"}>
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
                  a todas as empresas existentes e as que forem criadas
                  futuramente.
                </Text>
              }
              className="w-full"
            >
              <SelectBusinesses />
            </Field>
            {/* 
            o tipo padrão atualmente é apenas chatbot, mas futuramente
            será adicionado o tipo marketing e universal
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Tipo do fluxo"
              helperText="Se nenhum tipo for selecionado, o construtor será considerado <Mark>universal</Mark> e estará disponível para todos"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do construtor"
              />
            </Field> */}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isSubmitting}>
            Criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
