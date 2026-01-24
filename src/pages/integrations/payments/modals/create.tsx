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
// import {
//   FileUploadDropzone,
//   FileUploadList,
//   FileUploadRoot,
// } from "@components/ui/file-upload";
import TextareaAutosize from "react-textarea-autosize";

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
  access_token: z.string({ message: "Campo obrigatório." }).optional(),
  status: z.boolean().optional(),
  provider: z.enum(["mercadopago", "itau"]),
  clientId: z.string({ message: "Campo obrigatório." }).optional(),
  clientSecret: z.string({ message: "Campo obrigatório." }).optional(),
  pixKey: z.string({ message: "Campo obrigatório." }).optional(),
  // certificate: z.instanceof(File).optional(),
  // certPassword: z.string({ message: "Campo obrigatório." }).optional(),
});

export type Fields = z.infer<typeof FormSchema>;

const optionsProviders = [
  { label: "Mercado Pago", value: "mercadopago" },
  { label: "Banco Itaú PJ", value: "itau" },
  { label: "Asaas", value: "asaas", isDisabled: true },
  // { label: "Nubank", value: "nubank", isDisabled: true },
  // { label: "PayPal", value: "paypal", isDisabled: true },
  // { label: "PagSeguro", value: "pagseguro", isDisabled: true },
  // { label: "Stripe", value: "stripe", isDisabled: true },
  // { label: "Pagar.me", value: "pagarme", isDisabled: true },
];

export const ModalPayment: React.FC<Props> = (props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
    watch,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { provider: "mercadopago", status: true },
  });

  const provider = watch("provider");

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
          <VStack gap={2}>
            <p className="font-light leading-4 text-white/70">
              Esses dados são fornecidos pelo seu banco. A Junplid.com.br{" "}
              <strong className="text-white font-semibold">
                não acessa sua conta bancária
              </strong>
              ; ela apenas cria cobranças via Pix e recebe as confirmações de
              pagamento Pix.{" "}
              <strong className="font-black tracking-wider text-red-600 bg-yellow-300">
                Declaramos, ainda, que todos os dados informados abaixo são
                devidamente criptografados e tratados com segurança.
              </strong>
            </p>
            <Field
              errorText={errors.provider?.message}
              invalid={!!errors.provider}
              label="Instituição financeira"
            >
              <Controller
                name="provider"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    name={field.name}
                    placeholder="Selecione o banco"
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

            {provider === "mercadopago" && (
              <Field
                errorText={errors.access_token?.message}
                invalid={!!errors.access_token}
                label="Token de acesso"
                helperText="Seu Access Token fica em Configurações/API ou Credenciais do seu provedor (Mercado Pago, Itaú, ...)."
                className="mt-3"
              >
                <Input
                  {...register("access_token")}
                  autoComplete="off"
                  placeholder="Digite o token de acesso"
                />
              </Field>
            )}
            {provider === "itau" && (
              <>
                <Field
                  errorText={errors.clientId?.message}
                  invalid={!!errors.clientId}
                  label="Client ID"
                  className="mt-3"
                >
                  <Input
                    {...register("clientId")}
                    autoComplete="off"
                    placeholder="Digite o Client ID"
                  />
                </Field>
                <Field
                  errorText={errors.clientSecret?.message}
                  invalid={!!errors.clientSecret}
                  label="Client Secret"
                  className="mb-2"
                >
                  <Input
                    {...register("clientSecret")}
                    autoComplete="off"
                    placeholder="Digite o Client Secret"
                  />
                </Field>
                <Field
                  errorText={errors.pixKey?.message}
                  invalid={!!errors.pixKey}
                  label="Chave Pix"
                >
                  <TextareaAutosize
                    placeholder="Digite a chave Pix"
                    style={{ resize: "none" }}
                    minRows={1}
                    maxRows={2}
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                    {...register("pixKey")}
                  />
                </Field>
              </>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isPending}>
            Testar integração e criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
};
