import { JSX, useCallback, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxRoot,
  Input,
  VStack,
} from "@chakra-ui/react";
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
  DialogDescription,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInboxDepartment } from "../../../../hooks/inboxDepartment";
// import SelectBusinesses from "@components/SelectBusinesses";
import SelectInboxUsers from "@components/SelectInboxUsers";

interface IProps {
  onCreate?(business: any): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  // businessId: z.number({ message: "Campo obrigatório." }),
  signBusiness: z.boolean().optional(),
  signDepartment: z.boolean().optional(),
  signUser: z.boolean().optional(),
  previewNumber: z.boolean().optional(),
  previewPhoto: z.boolean().optional(),
  inboxUserIds: z.array(z.number()).optional(),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateInboxDepartment({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    control,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      previewNumber: true,
      previewPhoto: true,
      signBusiness: false,
      signDepartment: false,
      signUser: false,
    },
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createInboxDepartment, isPending } =
    useCreateInboxDepartment({
      setError,
      async onSuccess() {
        setOpen(false);
      },
    });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createInboxDepartment(fields);
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
      unmountOnExit
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        mx={2}
        as={"form"}
        onSubmit={handleSubmit(create)}
        w={"380px"}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar departamento</DialogTitle>
          <DialogDescription>
            Divida e organize seu workspace em departamentos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
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
              disabled
            >
              <Controller
                name="inboxUserIds"
                control={control}
                render={({ field }) => (
                  <SelectInboxUsers
                    name={field.name}
                    isDisabled
                    isMulti
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
                    disabled
                    w="full"
                    mx={0}
                    checked={value ?? false}
                    onCheckedChange={field.onChange}
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
                    onCheckedChange={field.onChange}
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
}
