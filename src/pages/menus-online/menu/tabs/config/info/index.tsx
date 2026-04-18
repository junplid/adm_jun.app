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
import { useHookFormMask } from "use-mask-input";

const FormSchema = z.object({
  delivery_fee: z.number().nullish(),
  lat: z.string().nullish(),
  lng: z.string().nullish(),
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

  deliveries_begin_at: z.string().nullish(),
  average_delivery_time: z.string().nullish(),
  minimum_value_per_order: z.number().nullish(),
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

  const registerWithMask = useHookFormMask(register);

  const edit = useCallback(
    async ({ lat, lng, ...fields }: Fields): Promise<void> => {
      if (!data?.id) return;
      try {
        if (lat && isNaN(Number(lat))) {
          setError("lat", { message: "Coordenadas inválidas" });
          return;
        }
        if (lng && isNaN(Number(lng))) {
          setError("lng", { message: "Coordenadas inválidas" });
          return;
        }
        await updateMenu({
          uuid,
          body: {
            ...fields,
            lat: lat ? Number(lat) : null,
            lng: lng ? Number(lng) : null,
          },
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (data?.info)
      reset({
        ...data.info,
        lat: data.info.lat ? String(data.info.lat) : null,
        lng: data.info.lng ? String(data.info.lng) : null,
      });
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
          errorText={errors.lat?.message}
          invalid={!!errors.lat}
          label="Lat"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("lat")} autoComplete="off" />
        </Field>
        <Field
          errorText={errors.lng?.message}
          invalid={!!errors.lng}
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
        errorText={errors.deliveries_begin_at?.message}
        invalid={!!errors.deliveries_begin_at}
        label="Horario que as Entregas/Delivery iniciam"
        disabled={isFetching || isLoading || isError}
        helperText="Deixe o espaço em branco se o seu serviço de entrega funcionar enquanto a loja estiver aberta."
      >
        <Input
          {...register("deliveries_begin_at")}
          autoComplete="off"
          {...registerWithMask(`deliveries_begin_at`, "99:99")}
        />
      </Field>
      <Field
        errorText={errors.average_delivery_time?.message}
        invalid={!!errors.average_delivery_time}
        label="Tempo médio de saída"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("average_delivery_time")}
          placeholder="30-45 min"
          autoComplete="off"
        />
      </Field>
      <Field
        errorText={errors.minimum_value_per_order?.message}
        invalid={!!errors.minimum_value_per_order}
        label="Valor mínimo por pedido"
        disabled={isFetching || isLoading || isError}
      >
        <Input
          {...register("minimum_value_per_order", {
            setValueAs: (v) =>
              v === "" ? null : Number(v) <= 0 ? 0 : Number(v),
          })}
          autoComplete="off"
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
