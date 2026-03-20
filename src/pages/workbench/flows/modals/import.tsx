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
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { FlowRow } from "..";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import SelectBusinesses from "@components/SelectBusinesses";
import { useImportFlow } from "../../../../hooks/flow";

interface IProps {
  onCreate?(business: FlowRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  flowId: z.string().min(1, "Campo obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalImportFlow({
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

  const { mutateAsync: importFlow, isPending } = useImportFlow({
    setError,
    async onSuccess() {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setOpen(false);
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const flow = await importFlow(fields);
      reset();
      props.onCreate?.(flow);
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
          <DialogTitle>Importar construtor de fluxo</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              errorText={errors.flowId?.message}
              invalid={!!errors.flowId}
              label="ID do construtor de fluxo"
            >
              <Input
                {...register("flowId")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o ID"
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
            Importar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
