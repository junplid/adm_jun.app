import { JSX, useCallback, useState } from "react";
import { Button, Input, VStack } from "@chakra-ui/react";
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
import TextareaAutosize from "react-textarea-autosize";
import { BusinessRow } from "..";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBusiness } from "../../../hooks/business";

interface IProps {
  onCreate?(business: BusinessRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  description: z.string().transform((value) => value.trim() || undefined),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateBusiness({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createBusiness, isPending } = useCreateBusiness({
    setError,
    async onSuccess() {
      setOpen(false);
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const business = await createBusiness(fields);
      const { name } = fields;
      reset();
      props.onCreate?.({ ...business, name });
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
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"470px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar projeto</DialogTitle>
          <DialogDescription>
            Crie um workspace para organizar e gerenciar suas operações.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Identificador"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do projeto"
              />
            </Field>
            <Field
              errorText={errors.description?.message}
              invalid={!!errors.description}
              label="Descrição"
            >
              <TextareaAutosize
                placeholder=""
                style={{ resize: "none" }}
                minRows={3}
                maxRows={10}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                {...register("description")}
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
