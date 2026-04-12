import { Field } from "@components/ui/field";
import { Button, Input } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import {
  useGetMenuOnline,
  useUpdateMenuOnlineInfo,
} from "../../../../../../hooks/menu-online";
import { useCallback, useEffect } from "react";
import SelectComponent from "@components/Select";

const FormSchema = z.object({
  delivery_fee: z.number().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  address: z.string().nullish(),
  state_uf: z.string().nullish(),
  city: z.string().nullish(),
  phone_contact: z.string().nullish(),
  whatsapp_contact: z.string().nullish(),
  payment_methods: z.array(
    z.enum(["Dinheiro", "Pix", "Cartao_Credito", "Cartao_Debito"]),
  ),
  price_per_km: z.number().nullish(),
  max_distance_km: z.number().nullish(),
});

type Fields = z.infer<typeof FormSchema>;

const optionsPayment = [
  { label: "Dinheiro", value: "Dinheiro" },
  { label: "Pix", value: "Pix" },
  { label: "Cartao_Credito", value: "Cartao_Credito" },
  { label: "Cartao_Debito", value: "Cartao_Debito" },
];

export function FormConfigInfoComponent({ uuid }: { uuid: string }) {
  const { data, isError, isFetching, isLoading } = useGetMenuOnline({ uuid });

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
    control,
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const { mutateAsync: updateMenu, isPending } = useUpdateMenuOnlineInfo({
    setError,
  });
  const edit = useCallback(async (fields: Fields): Promise<void> => {
    if (!data?.id) return;
    try {
      await updateMenu({ uuid, body: fields });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  useEffect(() => {
    if (data?.info) reset(data.info);
  }, [data]);

  return (
    <form
      onSubmit={handleSubmit(edit)}
      className="flex flex-col gap-y-2 px-1.5"
    >
      <Field
        errorText={errors.state_uf?.message}
        invalid={!!errors.state_uf}
        label="Estado(UF)"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("state_uf", { maxLength: 2 })}
          placeholder="BA"
          autoComplete="off"
        />
      </Field>
      <Field
        errorText={errors.city?.message}
        invalid={!!errors.city}
        label="Cidade"
        disabled={isFetching || isLoading || isError}
      >
        <Input {...register("city")} autoComplete="off" />
      </Field>
      <Field
        errorText={errors.address?.message}
        invalid={!!errors.address}
        label="Endereço da loja"
        disabled={isFetching || isLoading || isError}
      >
        <Input {...register("address")} autoComplete="off" />
      </Field>
      <div className="flex gap-x-2">
        <Field
          errorText={errors.address?.message}
          invalid={!!errors.address}
          label="Lat"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("lat")} autoComplete="off" />
        </Field>
        <Field
          errorText={errors.address?.message}
          invalid={!!errors.address}
          label="Lng"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("lng")} autoComplete="off" />
        </Field>
      </div>
      <Field
        errorText={errors.whatsapp_contact?.message}
        invalid={!!errors.whatsapp_contact}
        label="Contato WhatsApp"
        disabled={isFetching || isLoading || isError}
      >
        <Input {...register("whatsapp_contact")} autoComplete="off" />
      </Field>
      <Field
        errorText={errors.phone_contact?.message}
        invalid={!!errors.phone_contact}
        label="Contato"
        disabled={isFetching || isLoading || isError}
        helperText="Contato que o cliente pode: ligar, tirar duvidas, precisar de suporte..."
      >
        <Input {...register("phone_contact")} autoComplete="off" />
      </Field>
      <Field
        errorText={errors.payment_methods?.message}
        invalid={!!errors.payment_methods}
        label="Formas de pagamento"
        disabled={isFetching || isLoading || isError}
      >
        <Controller
          control={control}
          name="payment_methods"
          render={({ field }) => (
            <SelectComponent
              isClearable={false}
              isSearchable={false}
              options={optionsPayment}
              isMulti
              value={optionsPayment.filter((s) =>
                // @ts-expect-error
                field.value?.includes(s.value),
              )}
              ref={field.ref}
              onChange={(e: any) => {
                field.onChange(e.map((s: any) => s.value));
              }}
            />
          )}
        />
      </Field>
      <Field
        errorText={errors.delivery_fee?.message}
        invalid={!!errors.delivery_fee}
        label="Taxa Base de entrega"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("delivery_fee", {
            setValueAs: (v) =>
              v === "" ? null : Number(v) <= 0 ? 0 : Number(v),
          })}
          autoComplete="off"
        />
      </Field>
      <Field
        errorText={errors.max_distance_km?.message}
        invalid={!!errors.max_distance_km}
        label="Raio(KM) máximo da área de entrega (opcional)"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("max_distance_km", {
            setValueAs: (v) =>
              v === "" ? null : Number(v) <= 0 ? 0 : Number(v),
          })}
          autoComplete="off"
        />
      </Field>
      <Field
        errorText={errors.price_per_km?.message}
        invalid={!!errors.price_per_km}
        label="Valor por KM (opcional)"
        helperText="Taxa Base + (km * Valor por km) = Valor de entrega"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("price_per_km", {
            setValueAs: (v) =>
              v === "" ? null : Number(v) <= 0 ? 0 : Number(v),
          })}
          autoComplete="off"
        />
      </Field>
      <div className="flex gap-x-1.5 ml-auto mt-3">
        <Button
          type="button"
          disabled={isPending || !isDirty}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          Atualizar
        </Button>
      </div>
    </form>
  );
}
