import { JSX, useCallback, useContext, useState } from "react";
import { Button, VStack, Input } from "@chakra-ui/react";
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
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { pairMenuOnlineCodeDevice } from "../../../../../../services/api/MenuOnline";

interface IProps {
  onCreate(business: any): void;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  menuUuid: string;
}

const FormSchema = z.object({
  code: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
});

export type Fields = z.infer<typeof FormSchema>;

export function ModalPairCodeAppAgent({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { logout, clientMeta } = useContext(AuthContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });

  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        setLoad(true);
        await pairMenuOnlineCodeDevice(props.menuUuid, fields);
        setOpen(false);
        reset({});
        setLoad(false);
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast?.length)
              dataError.toast.forEach(toaster.create);
            if (dataError.input?.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    },
    [props.menuUuid],
  );

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit={false}
      preventScroll={false}
      closeOnInteractOutside={false}
      closeOnEscape={false}
      trapFocus={false}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
        w={clientMeta.isMobileLike ? undefined : "398px"}
        mx={2}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Parear com dispositivo</DialogTitle>
        </DialogHeader>
        <DialogBody
          mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
          px={clientMeta.isMobileLike ? 5 : undefined}
        >
          <VStack gap={4}>
            <Field
              label="Código"
              invalid={!!errors.code}
              errorText={errors.code?.message}
            >
              <Input {...register("code")} size={"sm"} />
            </Field>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={load}>
            Parear
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
