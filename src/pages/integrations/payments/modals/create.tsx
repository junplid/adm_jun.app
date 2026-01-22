import { Button, Input, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React, { JSX, useCallback, useState } from "react";
import { PaymentRow } from "..";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import SelectComponent from "@components/Select";
import { useCreatePaymentIntegration } from "../../../../hooks/paymentIntegration";

interface Props {
  onCreate?(business: PaymentRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

export const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório." })
    .trim()
    .min(1, { message: "Campo obrigatório." }),
  access_token: z
    .string({ message: "Campo obrigatório." })
    .trim()
    .min(1, { message: "Campo obrigatório." }),
  status: z.boolean().optional(),
  provider: z.enum(["mercadopago"]),
});

export type Fields = z.infer<typeof FormSchema>;

const optionsProviders = [
  { label: "Mercado Pago", value: "mercadopago" },
  { label: "Banco Itaú", value: "itau", isDisabled: true },
  { label: "Nubank", value: "nubank", isDisabled: true },
  { label: "PayPal", value: "paypal", isDisabled: true },
  { label: "PagSeguro", value: "pagseguro", isDisabled: true },
  { label: "Asaas", value: "asaas", isDisabled: true },
  { label: "Stripe", value: "stripe", isDisabled: true },
  { label: "Pagar.me", value: "pagarme", isDisabled: true },
];

export const ModalPayment: React.FC<Props> = (props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { provider: "mercadopago", status: true },
  });

  const { mutateAsync: createPayment, isPending } = useCreatePaymentIntegration(
    {
      setError,
      async onSuccess() {
        setOpen(false);
      },
    },
  );

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createPayment(fields);
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
          <DialogTitle>Criar integração de pagamento</DialogTitle>
          <DialogDescription>
            Centralize e controle suas integrações de pagamento.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt={"-5px"}>
          <VStack gap={4}>
            <Field
              errorText={errors.provider?.message}
              invalid={!!errors.provider}
              label="Provedor de pagamento"
            >
              <Controller
                name="provider"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    name={field.name}
                    placeholder="Selecione um provedor"
                    isMulti={false}
                    onBlur={field.onBlur}
                    options={optionsProviders}
                    isClearable={false}
                    onChange={(e: any) => {
                      field.onChange(e.value);
                    }}
                    value={
                      field.value
                        ? {
                            label: optionsProviders.find(
                              (item) => item.value === field.value,
                            )?.label,
                            value: field.value,
                          }
                        : null
                    }
                  />
                )}
              />
            </Field>
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
              errorText={errors.access_token?.message}
              invalid={!!errors.access_token}
              label="Token de acesso"
              helperText="Seu Access Token fica em Configurações/API ou Credenciais do seu provedor (Mercado Pago, Itaú, ...)."
            >
              <Input
                {...register("access_token")}
                autoComplete="off"
                placeholder="Digite o token de acesso"
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
};
