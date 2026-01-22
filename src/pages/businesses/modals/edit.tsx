import { Button, Input, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useCallback, useMemo, useState, JSX, useEffect } from "react";
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
import { useForm } from "react-hook-form";
import deepEqual from "fast-deep-equal";
import { Field } from "@components/ui/field";
import TextareaAutosize from "react-textarea-autosize";
import { CloseButton } from "@components/ui/close-button";
import { useGetBusiness, useUpdateBusiness } from "../../../hooks/business";

interface PropsModalEdit {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z
    .string()
    .min(1, "Campo obrigatório.")
    .transform((value) => value.trim() || undefined),
  description: z.string().optional().nullish(),
});

type Fields = z.infer<typeof FormSchema>;

interface FieldCreateBusiness {
  name: string;
  description?: string;
}

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const [fieldsDraft, setFieldsDraft] = useState<FieldCreateBusiness | null>(
    null,
  );

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    setValue,

    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateBusiness, isPending } = useUpdateBusiness({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetBusiness(id);

  useEffect(() => {
    if (data) {
      setFieldsDraft({ ...data, description: data.description || undefined });
      setValue("name", data.name);
      setValue("description", data.description || undefined);
    }
  }, [data]);

  const edit = useCallback(
    async (fieldss: Fields): Promise<void> => {
      try {
        await updateBusiness({ id, body: fieldss });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [fieldsDraft],
  );

  const fields = watch();
  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsDraft, fields);
  }, [fields, fieldsDraft]);

  return (
    <form onSubmit={handleSubmit(edit)}>
      <DialogBody as={"div"}>
        <VStack gap={4}>
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Identificador"
            autoFocus={false}
          >
            <Input
              {...register("name")}
              autoComplete="off"
              placeholder="Digite o nome do projeto"
            />
          </Field>
          <Field
            errorText={errors.description?.message}
            invalid={!!errors.description}
            label="Descrição"
            autoFocus={false}
          >
            <TextareaAutosize
              placeholder=""
              style={{ resize: "none" }}
              minRows={3}
              maxRows={10}
              className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
              {...register("description")}
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

export const ModalEditBusiness: React.FC<PropsModalEdit> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"470px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar projeto</DialogTitle>
        <DialogDescription>
          Edite as informações do seu workspace.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
