import { JSX, useCallback, useEffect, useMemo, useState } from "react";
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
import { useGetFlow, useUpdateFlow } from "../../../../hooks/flow";
import deepEqual from "fast-deep-equal";

interface IProps {
  id: string;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["marketing", "chatbot", "universal"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()),
});

type Fields = z.infer<typeof FormSchema>;

function Content({
  id,
  ...props
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const [fieldsDraft, setFieldsDraft] = useState<Fields | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    getValues,
    control,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateBusiness, isPending } = useUpdateFlow({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetFlow(id);

  useEffect(() => {
    if (data) {
      setFieldsDraft(data);
      setValue("name", data.name);
      setValue("type", data.type);
      setValue("businessIds", data.businessIds);
    }
  }, [data]);

  const edit = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await updateBusiness({ id, body: fields });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [fieldsDraft]
  );

  const fields = watch();
  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsDraft, fields);
  }, [fields, fieldsDraft]);

  return (
    <form onSubmit={handleSubmit(edit)}>
      <DialogBody>
        <VStack gap={4}>
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Nome"
          >
            <Input
              {...register("name")}
              autoComplete="off"
              autoFocus
              placeholder="Digite o nome do construtor"
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
          disabled={isFetching || isPending || !isSave}
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
        <DialogTitle>Editar construtor de fluxo</DialogTitle>
        <DialogDescription>
          Imagine e construa fluxos de conversa de forma visual e intuitiva.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
