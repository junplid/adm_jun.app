import { JSX, useCallback, useContext, useState } from "react";
import { Button, RadioCard, VStack } from "@chakra-ui/react";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateMenuOnlineSubItemsStatus } from "../../../../../../services/api/MenuOnline";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import SelectMenuOnlineSubItems from "@components/SelectMenuOnlineSubItems";

interface IProps {
  onCreate(): void;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  menuUuid: string;
}

const FormSchema = z.object({
  subItemsUuid: z.array(z.string()).min(1, { message: "Campo obrigatório." }),
  action: z.enum(["false", "true"], { message: "Campo obrigatório." }),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalUpdateBulk({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { logout, clientMeta } = useContext(AuthContext);
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm<Fields>({
    shouldFocusError: true,
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues: { action: "true" },
  });

  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        setLoad(true);
        await updateMenuOnlineSubItemsStatus(props.menuUuid, fields);
        setLoad(false);
        reset({});
        props.onCreate();
        setOpen(false);
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
      onOpenChange={(e) => {
        setOpen(e.open);
        setTimeout(() => {
          reset({});
        }, 300);
      }}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
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
          <DialogTitle>Atulização em massa de opções</DialogTitle>
        </DialogHeader>
        <DialogBody
          mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
          px={clientMeta.isMobileLike ? 4 : undefined}
        >
          <VStack gap={4}>
            <Field
              errorText={errors.subItemsUuid?.message}
              invalid={!!errors.subItemsUuid}
              label={
                <span>
                  Selecione as opções <span className="text-red-300">*</span>
                </span>
              }
            >
              <Controller
                name="subItemsUuid"
                control={control}
                render={({ field }) => (
                  <SelectMenuOnlineSubItems
                    uuid={props.menuUuid}
                    name={field.name}
                    isMulti
                    ref={field.ref}
                    isSearchable={false}
                    onBlur={field.onBlur}
                    onChange={(e: any) => {
                      field.onChange(e.map((item: any) => item.value));
                    }}
                    value={field.value}
                  />
                )}
              />
            </Field>
            <Controller
              control={control}
              name="action"
              render={({ field }) => (
                <RadioCard.Root
                  className="w-full"
                  variant={"subtle"}
                  size={"sm"}
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                >
                  <div className="w-full flex gap-x-2">
                    <RadioCard.Item value={"true"}>
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl>
                        <RadioCard.ItemText>Ativar</RadioCard.ItemText>
                        <RadioCard.ItemIndicator />
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                    <RadioCard.Item value={"false"}>
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl>
                        <RadioCard.ItemText>Desativar</RadioCard.ItemText>
                        <RadioCard.ItemIndicator />
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  </div>
                </RadioCard.Root>
              )}
            />
            {errors?.action?.message && (
              <span className="text-red-400">{errors?.action?.message}</span>
            )}
            {errors?.root?.message && (
              <span className="text-red-400">{errors?.root?.message}</span>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={load}>
            Atualizar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
