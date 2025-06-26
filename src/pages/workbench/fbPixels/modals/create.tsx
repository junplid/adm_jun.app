import { JSX, useCallback, useEffect, useState } from "react";
import { Button, Input, Spinner, Text, VStack } from "@chakra-ui/react";
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
import { FbPixelRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import TextareaAutosize from "react-textarea-autosize";
import { useCreateFbPixel, useTestFbPixel } from "../../../../hooks/fbPixel";
import { HiBadgeCheck } from "react-icons/hi";
import { BiMessageAltError } from "react-icons/bi";
import { Tooltip } from "@components/ui/tooltip";

interface IProps {
  onCreate?(business: FbPixelRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
  pixel_id: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
  access_token: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
  status: z.boolean().optional(),
  businessId: z.number().optional(),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateFlow({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setError,
    watch,
    reset: restFields,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);
  const [test_event_code, setTestEventCode] = useState("");

  const { mutateAsync: createFbPixel, isPending } = useCreateFbPixel({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const {
    mutateAsync: testFbP,
    isPending: loadStatusTest,
    status,
    reset,
  } = useTestFbPixel();

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createFbPixel(fields);
      restFields({});
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const access_token = watch("access_token");
  const pixel_id = watch("pixel_id");

  useEffect(() => {
    if (!open) {
      restFields({});
      setTestEventCode("");
    }
  }, [open]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
        w={"398px"}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar pixel do Facebook</DialogTitle>
          <DialogDescription>
            Rastrear e otimizar anúncios com mais precisão.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              label="Anexe projetos"
              helperText={
                <Text>
                  Se nenhum projeto for selecionado, ao pixel será anexado a
                  todos os projetos existentes e os que forem criados no futuro.
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
                    isClearable={true}
                    onBlur={field.onBlur}
                    onChange={(e: any) => {
                      if (!e) {
                        field.onChange(undefined);
                        return;
                      }
                      field.onChange(e.value);
                    }}
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
                autoComplete="off"
                placeholder="Digite o ID do pixel"
                {...register("pixel_id", {
                  onChange: () => reset(),
                })}
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
                {...register("access_token", {
                  onChange: () => reset(),
                })}
              />
            </Field>
            <div>
              <Field
                label="Código do evento de teste"
                helperText={
                  "Teste o pixel antes de cria-lo para garantir que está funcionando corretamente."
                }
              >
                <div className="flex flex-row w-full items-center gap-2">
                  <Input
                    autoComplete="off"
                    placeholder="Código do evento"
                    onChange={(e) => setTestEventCode(e.target.value)}
                    disabled={loadStatusTest || status === "success"}
                    value={test_event_code}
                  />
                  {status !== "success" ? (
                    <div className="grid grid-cols-[1fr_20px] items-center gap-2">
                      {!loadStatusTest && (
                        <button
                          onClick={() => {
                            if (
                              !access_token?.trim() ||
                              !pixel_id?.trim() ||
                              !test_event_code?.trim()
                            ) {
                              alert("aq");
                              return;
                            }
                            testFbP({
                              access_token,
                              pixel_id,
                              test_event_code,
                            });
                          }}
                          className="disabled:opacity-40 disabled:hover:bg-blue-200/5 text-nowrap px-4 hover:bg-blue-200/10 bg-blue-200/5 cursor-pointer border border-white/10 hover: rounded-sm text-xs h-full"
                          type="button"
                          disabled={
                            !pixel_id?.trim() ||
                            !access_token?.trim() ||
                            !test_event_code?.trim() ||
                            loadStatusTest
                          }
                        >
                          Testar
                        </button>
                      )}
                      {loadStatusTest ? (
                        <Spinner />
                      ) : (
                        <Tooltip content="Pixel não está funcionando corretamente.">
                          <BiMessageAltError
                            size={28}
                            className="text-red-400"
                          />
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <Tooltip content="Pixel funcionando corretamente.">
                      <HiBadgeCheck size={28} className="text-green-300" />
                    </Tooltip>
                  )}
                </div>
              </Field>
            </div>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button
            type="submit"
            loading={isPending}
            disabled={status !== "success"}
          >
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
