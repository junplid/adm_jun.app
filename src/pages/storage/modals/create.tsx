import { JSX, useCallback, useState } from "react";
import { Button, VStack } from "@chakra-ui/react";
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
import { StorageFileRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import {
  FileUploadDropzone,
  FileUploadList,
  FileUploadRoot,
} from "@components/ui/file-upload";
import { useCreateStorageFile } from "../../../hooks/storage-file";

interface IProps {
  onCreate?(business: StorageFileRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

// function removeExt(filename: string): string {
//   const idx = filename.lastIndexOf(".");
//   return idx === -1 ? filename : filename.slice(0, idx);
// }

const FormSchema = z.object({
  businessIds: z.array(z.number()).optional(),
  files: z.array(z.instanceof(File)).min(1, "Selecione pelo menos um arquivo."),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateFlow({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setError,
    setValue,
    getValues,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createStorageFile, isPending } = useCreateStorageFile();

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      for await (const file of fields.files) {
        await createStorageFile({ file, businessIds: fields.businessIds });
      }
      reset({});
      setOpen(false);
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
      // placement={placement}
      motionPreset="slide-in-bottom"
      lazyMount
      unmountOnExit
      scrollBehavior={"outside"}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"478px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Adicionar arquivos</DialogTitle>
          <DialogDescription>
            Armazene seus arquivos em vários formatos para suas operações.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt="-8px">
          <VStack gap={4}>
            <Field
              label="Anexe projetos"
              helperText={
                "Se nenhum projeto for selecionado, o arquivo será anexado a todos os projetos existentes e os que forem criados no futuro."
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

            <Controller
              control={control}
              name="files"
              render={({ field }) => (
                <FileUploadRoot
                  name={field.name}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  maxFiles={10}
                  onFileChange={(details) => {
                    field.onChange([
                      ...(field.value || []),
                      ...details.acceptedFiles,
                    ]);
                  }}
                >
                  <FileUploadDropzone
                    minH={"auto"}
                    w={"100%"}
                    label="Arraste e solte os arquivos aqui ou clique para selecioná-los"
                  />
                  <FileUploadList clearable showSize />
                </FileUploadRoot>
              )}
            />
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isPending}>
            Adicionar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
