import { Button, Input, VStack } from "@chakra-ui/react";
import { JSX, useCallback, useEffect } from "react";
import { AxiosError } from "axios";
import SelectComponent from "../../../../components/Select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
  useGetPaymentIntegration,
  useUpdatePaymentIntegration,
} from "../../../../hooks/paymentIntegration";

interface Props {
  id: number;
  close: () => void;
}

export const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório." })
    .trim()
    .min(1, { message: "Campo obrigatório." }),
  access_token: z.string().optional(),
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
    getValues,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { status: true, provider: "mercadopago" },
  });

  const { data } = useGetPaymentIntegration(id);

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const { mutateAsync: updatePayment, isPending } = useUpdatePaymentIntegration(
    {
      setError,
      async onSuccess() {
        props.onClose();
        await new Promise((resolve) => setTimeout(resolve, 220));
      },
    },
  );

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);
      await updatePayment({ id, body: changedFields });
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

export function ModalEditAgentAI(props: Props): JSX.Element {
  return (
    <DialogContent w={"390px"} backdrop>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar integração de pagamento</DialogTitle>
        <DialogDescription>
          Centralize e controle suas integrações de pagamento.
        </DialogDescription>
      </DialogHeader>
      <Content id={props.id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
