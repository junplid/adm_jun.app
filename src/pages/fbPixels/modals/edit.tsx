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
import TextareaAutosize from "react-textarea-autosize";
import { useGetFbPixel, useUpdateFbPixel } from "../../../hooks/fbPixel";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  pixel_id: z.string().min(1, "Campo obrigatório."),
  access_token: z.string().min(1, "Campo obrigatório."),
  status: z.boolean().optional(),
  businessId: z.number().optional().nullable(),
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
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    setError,
    getValues,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const { mutateAsync: updateFbPixel, isPending } = useUpdateFbPixel({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetFbPixel(id);

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
      await updateFbPixel({ id, body: changedFields });
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
            label="Anexe projetos"
            helperText={
              <Text>
                Se nenhum projeto for selecionado, ao pixel será anexado a todos
                os projetos existentes e os que forem criados no futuro.
              </Text>
            }
            errorText={errors.businessId?.message}
            invalid={!!errors.businessId}
            className="w-full"
          >
            <Controller
              name="businessId"
              control={control}
              render={({ field }) => (
                <SelectBusinesses
                  name={field.name}
                  isMulti={false}
                  onBlur={field.onBlur}
                  isClearable={false}
                  onChange={(e: any) => field.onChange(e.value)}
                  setError={({ name, message }) => {
                    if (name === "name") setError("businessId", { message });
                  }}
                  onCreate={(business) => field.onChange(business.id)}
                  value={field.value}
                />
              )}
            />
          </Field>
          <Field
            errorText={errors.name?.message}
            invalid={!!errors.name}
            label="Nome"
          >
            <Input
              autoFocus
              autoComplete="off"
              placeholder="Digite o nome do pixel"
              {...register("name")}
            />
          </Field>
          <Field
            errorText={errors.pixel_id?.message}
            invalid={!!errors.pixel_id}
            label="Identificação do conjunto de dados"
          >
            <Input
              autoFocus
              autoComplete="off"
              placeholder="Digite o ID do pixel"
              {...register("pixel_id")}
            />
          </Field>
          <Field
            errorText={errors.access_token?.message}
            invalid={!!errors.access_token}
            label="Token de acesso"
            helperText={
              <ul className="list-decimal pl-4 flex flex-col gap-2 mt-1">
                <li>
                  Acesse{" "}
                  <strong className="text-white font-medium">
                    Gerenciador de Eventos
                  </strong>{" "}
                  do pixel →{" "}
                  <strong className="text-white font-medium">
                    Fontes de Dados
                  </strong>
                  .
                </li>
                <li>
                  Selecione o Pixel desejado e abra{" "}
                  <strong className="text-white font-medium">
                    Configurações
                  </strong>
                  .
                </li>
                <li>
                  Role até{" "}
                  <strong className="text-white font-medium">
                    Configurar integração
                  </strong>{" "}
                  direta e clique em{" "}
                  <strong className="text-white font-medium">
                    Gerar token de acesso
                  </strong>
                  .
                </li>
                <li>
                  Garanta que o token tenha permissão:{" "}
                  <strong className="text-white font-medium">
                    Gerenciar eventos
                  </strong>
                  .
                </li>
              </ul>
            }
          >
            <TextareaAutosize
              placeholder="Digite o token de acesso direto"
              style={{ resize: "none" }}
              minRows={6}
              maxRows={6}
              className="p-3 py-2.5 rounded-sm overflow-hidden w-full border-black/10 dark:border-white/10 border"
              {...register("access_token")}
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

export function ModalEditTag({ id, ...props }: IProps): JSX.Element {
  return (
    <DialogContent w={"348px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar etiqueta</DialogTitle>
        <DialogDescription>O limite é a sua imaginação.</DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
