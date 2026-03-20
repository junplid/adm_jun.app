import {
  Button,
  Checkbox,
  CheckboxRoot,
  Input,
  VStack,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useCallback, JSX, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@components/ui/field";
import { CloseButton } from "@components/ui/close-button";
import SelectInboxUsers from "@components/SelectInboxUsers";
import {
  useGetInboxDepartment,
  useUpdateInboxDepartment,
} from "../../../../hooks/inboxDepartment";
// import SelectBusinesses from "@components/SelectBusinesses";

interface PropsModalEdit {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  businessId: z.number({ message: "Campo obrigatório." }),
  signBusiness: z.boolean().optional(),
  signDepartment: z.boolean().optional(),
  signUser: z.boolean().optional(),
  previewNumber: z.boolean().optional(),
  previewPhoto: z.boolean().optional(),
  inboxUserIds: z.array(z.number()).optional(),
});

type Fields = z.infer<typeof FormSchema>;

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
    control,
    getValues,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateInboxDepartment, isPending } =
    useUpdateInboxDepartment({
      setError,
      async onSuccess() {
        props.onClose();
        await new Promise((resolve) => setTimeout(resolve, 220));
      },
    });
  const { data, isFetching } = useGetInboxDepartment(id);

  useEffect(() => {
    if (data) reset(data);
  }, [data]);

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);
      await updateInboxDepartment({ id, body: changedFields });
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
      <DialogBody as={"div"}>
        <VStack gap={4} mt={"-10px"}>
          {/* <Field
            label="Anexar projeto"
            errorText={errors.businessId?.message}
            invalid={!!errors.businessId}
            className="w-full"
            required
          >
            <Controller
              name="businessId"
              control={control}
              render={({ field }) => (
                <SelectBusinesses
                  name={field.name}
                  isClearable={false}
                  isMulti={false}
                  onBlur={field.onBlur}
                  onChange={(e: any) => field.onChange(e.value)}
                  onCreate={(business) => field.onChange(business.id)}
                  value={field.value}
                />
              )}
            />
          </Field> */}
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Nome do departamento"
            required
          >
            <Input
              {...register("name")}
              autoComplete="off"
              autoFocus
              placeholder="Digite o nome do departamento"
            />
          </Field>
          <Field
            label="Selecione os atendentes"
            errorText={errors.inboxUserIds?.message}
            invalid={!!errors.inboxUserIds}
            className="w-full"
          >
            <Controller
              name="inboxUserIds"
              control={control}
              render={({ field }) => (
                <SelectInboxUsers
                  name={field.name}
                  isMulti
                  isDisabled
                  onBlur={field.onBlur}
                  onChange={(e: any) => {
                    field.onChange(e.map((item: any) => item.value));
                  }}
                  value={field.value}
                />
              )}
            />
          </Field>
          <div className="w-full flex gap-y-3 flex-col">
            <Controller
              control={control}
              name="previewNumber"
              render={({ field: { value, ...field } }) => (
                <CheckboxRoot
                  {...field}
                  variant="subtle"
                  w="full"
                  mx={0}
                  disabled
                  checked={value ?? false}
                  onCheckedChange={() => {
                    field.onChange(!value);
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    Atendentes podem ver o número do contato
                  </Checkbox.Label>
                </CheckboxRoot>
              )}
            />

            <Controller
              control={control}
              name="previewPhoto"
              render={({ field: { value, ...field } }) => (
                <CheckboxRoot
                  {...field}
                  variant="subtle"
                  w="full"
                  mx={0}
                  disabled
                  checked={value ?? false}
                  onCheckedChange={() => {
                    field.onChange(!value);
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    Atendentes podem ver a foto do contato
                  </Checkbox.Label>
                </CheckboxRoot>
              )}
            />
          </div>
        </VStack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" disabled={isSubmitting} variant="outline">
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          type="submit"
          colorPalette={"teal"}
          disabled={isFetching || isPending || !isDirty}
          loading={isSubmitting}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export const ModalEditInboxDepartment: React.FC<PropsModalEdit> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"470px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar departamento</DialogTitle>
        <DialogDescription>
          Edite as informações do seu departamento.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
