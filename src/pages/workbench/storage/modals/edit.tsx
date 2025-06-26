import { JSX, useCallback, useEffect } from "react";
import { Button, Input, Text, VStack } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
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
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import {
  useGetStorageFile,
  useUpdateStorageFile,
} from "../../../../hooks/storage-file";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  originalName: z.string().min(1, "Campo obrigatório."),
  businessIds: z.array(z.number()),
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
    setValue,
    getValues,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateStorageFile, isPending } = useUpdateStorageFile({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetStorageFile(id);

  useEffect(() => {
    if (data) {
      reset({
        originalName: data.originalName,
        businessIds: data.businessIds || [],
      });
    }
  }, [data]);

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);

      await updateStorageFile({ id, body: changedFields });
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
      <DialogBody>
        <VStack gap={4}>
          <Field
            errorText={errors.originalName?.message}
            invalid={!!errors.originalName}
            label="Nome"
          >
            <Input
              {...register("originalName")}
              autoComplete="off"
              autoFocus
              placeholder="Digite o nome do arquivo"
            />
          </Field>
          <Field
            label="Anexe projetos"
            helperText={
              <Text>
                Se nenhum projeto for selecionado, o construtor será anexado a
                todos os projetos existentes e os que forem criados no futuro.
              </Text>
            }
            className="w-full"
            errorText={errors.businessIds?.message}
            invalid={!!errors.businessIds}
          >
            <Controller
              name="businessIds"
              control={control}
              render={({ field }) => (
                <SelectBusinesses
                  name={field.name}
                  isMulti
                  onBlur={field.onBlur}
                  onChange={(e: any) => {
                    field.onChange(e.map((item: any) => item.value));
                  }}
                  setError={({ name, message }) => {
                    if (name === "name") {
                      setError("businessIds", { message });
                    }
                  }}
                  onCreate={(business) => {
                    setValue("businessIds", [
                      ...(getValues("businessIds") || []),
                      business.id,
                    ]);
                  }}
                  value={field.value}
                />
              )}
            />
          </Field>
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

export function ModalEditFlow({ id, close }: IProps): JSX.Element {
  return (
    <DialogContent w={"348px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar informações do arquivo</DialogTitle>
        <DialogDescription>
          Armazene seus arquivos em vários formatos para suas operações.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
