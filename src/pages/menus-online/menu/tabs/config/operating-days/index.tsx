import { Field } from "@components/ui/field";
import { Button, IconButton, Input } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import {
  useGetMenuOnline,
  useUpdateMenuOnlineOperatingDays,
} from "../../../../../../hooks/menu-online";
import { useCallback, useEffect, useMemo } from "react";
import SelectComponent from "@components/Select";
import { MdHorizontalRule, MdOutlineDeleteOutline } from "react-icons/md";
import { useHookFormMask } from "use-mask-input";

const FormSchema = z.object({
  days: z.array(
    z.object({
      dayOfWeek: z.number({ message: "Campo obrigatório." }),
      startHourAt: z.string({ message: "Campo obrigatório." }).min(1, { message: "Campo obrigatório." }),
      endHourAt: z.string({ message: "Campo obrigatório." }).min(1, { message: "Campo obrigatório." }),
    })
  ),
});

type Fields = z.infer<typeof FormSchema>;

const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

export function FormConfigOperatingDaysComponent({ uuid }: { uuid: string }) {
  const { data } = useGetMenuOnline({ uuid });

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
    control,
    setError,
    watch,
    setValue,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const { mutateAsync: updateMenu, isPending } = useUpdateMenuOnlineOperatingDays({
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
    if (data?.operatingDays) reset({ days: data.operatingDays });
  }, [data]);

  const operatingDays = watch("days");
  const registerWithMask = useHookFormMask(register);

  const optionsOpertaingDaysMemo = useMemo(() => {
    if (!operatingDays?.length) return optionsOpertaingDays;
    const selectedDays = operatingDays.map((day) => day.dayOfWeek);
    return optionsOpertaingDays.filter((s) => !selectedDays.includes(s.value));
  }, [operatingDays?.length]);

  return (
    <form
      onSubmit={handleSubmit(edit)}
      className="flex flex-col gap-y-2 px-1.5"
    >
      {!!operatingDays?.length && (
        <ul className="flex flex-col gap-3">
          {operatingDays.map((day, dayIndex) => (
            <li
              key={dayIndex}
              className="flex w-full items-center gap-x-2"
            >
              <IconButton
                size={"xs"}
                variant={"ghost"}
                type="button"
                color={"red.100"}
                _hover={{ color: "red.400" }}
                onClick={() => {
                  setValue(
                    "days",
                    operatingDays.filter(
                      (o) => o.dayOfWeek !== day.dayOfWeek,
                    ),
                    { shouldDirty: true }
                  );
                }}
              >
                <MdOutlineDeleteOutline />
              </IconButton>
              <div className="flex flex-col max-w-xs">
                <span className="font-medium">{optionsOpertaingDays.find(s => s.value === day.dayOfWeek)?.label}</span>
                <div className="flex w-full items-center gap-2">
                  <Field
                    errorText={errors.days?.[dayIndex]?.startHourAt?.message}
                    invalid={!!errors.days?.[dayIndex]?.startHourAt?.message}
                  >
                    <Input
                      placeholder="HH:mm"
                      step={"60"}
                      size={"xs"}
                      {...registerWithMask(`days.${dayIndex}.startHourAt`, "99:99")}
                    />
                  </Field>
                  <MdHorizontalRule size={33} />
                  <Field
                    errorText={errors.days?.[dayIndex]?.endHourAt?.message}
                    invalid={!!errors.days?.[dayIndex]?.endHourAt?.message}
                  >
                    <Input
                      placeholder="HH:mm"
                      size={"xs"}
                      {...registerWithMask(`days.${dayIndex}.endHourAt`, "99:99")}

                    />
                  </Field>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!!optionsOpertaingDaysMemo.length && (
        <Controller
          control={control}
          name="days"
          render={({ field }) => (
            <SelectComponent
              isMulti={false}
              onBlur={() => { }}
              name={field.name}
              isDisabled={field.disabled}
              ref={field.ref}
              placeholder="Selecione os dias da semana"
              onChange={(e: any) => {
                if (!field.value?.length) {
                  field.onChange([
                    { dayOfWeek: e.value, startHourAt: "", endHourAt: "" },
                  ]);
                  return;
                }
                field.onChange([
                  ...field.value,
                  {
                    dayOfWeek: e.value,
                    startHourAt: operatingDays[field.value.length - 1].startHourAt || "",
                    endHourAt: operatingDays[field.value.length - 1].endHourAt || ""
                  }
                ]);
              }}
              options={optionsOpertaingDaysMemo}
              value={null}
            />
          )}
        />
      )}

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
