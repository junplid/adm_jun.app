import { JSX, useCallback, useEffect, useState } from "react";
import {
  Button,
  Center,
  Clipboard,
  Image,
  Input,
  Text,
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
import { FbPixelRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import TextareaAutosize from "react-textarea-autosize";
import { useCreateFbPixel } from "../../../hooks/fbPixel";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import { HiChevronDoubleDown } from "react-icons/hi";

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
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"info" | "fields">("info");

  const { mutateAsync: createFbPixel, isPending } = useCreateFbPixel({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createFbPixel(fields);
      reset({});
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) reset({});
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
          <TabsRoot
            value={currentTab}
            onValueChange={(s) => setCurrentTab(s.value as any)}
            lazyMount
            unmountOnExit
            variant={"enclosed"}
          >
            <Center mb={2}>
              <TabsList bg="#1c1c1c" rounded="l3" p="1.5">
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="info"
                  py={"27px"}
                >
                  Virar parceiro
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="fields"
                  py={"27px"}
                >
                  Fazer integração
                </TabsTrigger>
              </TabsList>
            </Center>
            <TabsContent value="info" mt={"-10px"}>
              <VStack gap={4}>
                <Text>
                  Se você ainda não é nosso parceiro e deseja integrar o pixel
                  do Facebook, siga as instruções abaixo:
                </Text>
                <ul className="list-decimal pl-4 flex flex-col gap-4 mt-1">
                  <li>
                    Acesse a página de{" "}
                    <strong className="text-white font-bold">
                      Configurações
                    </strong>{" "}
                    do seu negócio.
                  </li>
                  <li>
                    Acesse a página de Parceiros em:{" "}
                    <strong className="text-white font-bold">Usuários</strong> →{" "}
                    <strong className="text-white font-bold">Parceiros</strong>.
                  </li>
                  <li>
                    <div className="flex flex-col gap-1">
                      <Image src="/fb-pixel/add-parceiro.png" />
                      <Clipboard.Root value={"611581845070118"}>
                        <Clipboard.Trigger asChild>
                          <Button w={"full"} variant={"ghost"} size={"xs"}>
                            <Clipboard.Indicator />
                            Copiar Identificação da Junplid
                          </Button>
                        </Clipboard.Trigger>
                      </Clipboard.Root>
                    </div>
                  </li>
                  <li className="flex justify-center">
                    <HiChevronDoubleDown size={25} color="#8d8d8d" />
                  </li>
                  <li>
                    <div className="flex flex-col gap-1 mb-2">
                      <span>
                        Acesse a aba <strong>Conjuntos de dados</strong>
                      </span>
                      <span className="pl-3">
                        - Selecione os pixels que a Junplid pode gerenciar;
                      </span>
                      <span className="pl-3">
                        - Habilite o <strong>Controle total</strong>;
                      </span>
                      <span className="text-orange-500 text-sm pl-3 bg-white/5 rounded-sm p-2 pr-3">
                        Se algum pixel não estiver funcionando corretamente,
                        verifique se somos um parceiro e se a Junplid tem acesso
                        para gerenciar seu pixel.
                      </span>
                    </div>
                    <Image src="/fb-pixel/conf-pixel.png" />
                  </li>
                  <li>
                    Clique em <strong>Salvar alterações</strong>.
                  </li>
                </ul>
              </VStack>
            </TabsContent>
            <TabsContent value="fields" mt={"-10px"}>
              <VStack gap={4}>
                <Field
                  label="Anexe projetos"
                  helperText={
                    <Text>
                      Se nenhum projeto for selecionado, ao pixel será anexado a
                      todos os projetos existentes e os que forem criados no
                      futuro.
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
                          if (name === "name")
                            setError("businessId", { message });
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
            </TabsContent>
          </TabsRoot>
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
