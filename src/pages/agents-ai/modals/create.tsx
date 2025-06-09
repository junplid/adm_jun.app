import {
  Button,
  Center,
  Image,
  Input,
  NumberInput,
  VStack,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import React, { JSX, useCallback, useState } from "react";
import { AgentsAIRow } from "..";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import SelectBusinesses from "@components/SelectBusinesses";
import { Field } from "@components/ui/field";
import { MdOutlineImage } from "react-icons/md";
import {
  PiFile,
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import { VscMic } from "react-icons/vsc";
import { TbHeadphones } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import { CloseButton } from "@components/ui/close-button";
import { BsCaretDownFill } from "react-icons/bs";
import { IoMdImage } from "react-icons/io";
import { api } from "../../../services/api";
import { RiDeleteBin7Line } from "react-icons/ri";
import SelectComponent from "@components/Select";
import { useCreateAgentAI } from "../../../hooks/agentAI";

interface Props {
  onCreate?(business: AgentsAIRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

export const FormSchema = z.object({
  providerCredentialId: z.number().optional(),
  apiKey: z.string().optional(),
  nameProvider: z.string().optional(),

  businessIds: z
    .array(z.number(), { message: "Campo obrigatório" })
    .min(1, { message: "Campo obrigatório" }),
  name: z.string().min(1, { message: "Campo obrigatório" }),
  emojiLevel: z.enum(["none", "low", "medium", "high"]).optional(),
  language: z.string().optional(),
  personality: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
  model: z.string().min(1, { message: "Campo obrigatório" }),
  temperature: z
    .number()
    .min(0, { message: "Valor mínimo é 0" })
    .max(1, { message: "Valor máximo é 1" })
    .optional(),
  knowledgeBase: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
  files: z
    .array(
      z.object({
        id: z.number(),
        fileName: z.string().nullish(),
        originalName: z.string(),
        mimetype: z.string().nullish(),
      })
    )
    .optional(),

  instructions: z
    .array(
      z.object({
        prompt: z.string().optional(),
        files: z
          .array(
            z.object({
              id: z.number(),
              fileName: z.string().nullish(),
              originalName: z.string(),
              mimetype: z.string().nullish(),
            })
          )
          .optional(),
        promptAfterReply: z.string().optional(),
      })
    )
    .optional(),
});

export type Fields = z.infer<typeof FormSchema>;

const IconPreviewFile = (p: { mimetype: string }): JSX.Element => {
  if (/^image\//.test(p.mimetype)) {
    return <IoMdImage color="#6daebe" size={24} />;
  }
  if (/^video\//.test(p.mimetype)) {
    return <PiFileVideoFill color="#8eb87a" size={24} />;
  }
  if (/^audio\//.test(p.mimetype)) {
    return <PiFileAudioFill color="#d4b663" size={24} />;
  }
  if (p.mimetype === "application/pdf") {
    return <PiFilePdfFill color="#db8c8c" size={24} />;
  }
  if (/^text\//.test(p.mimetype)) {
    return <PiFileTextFill color="#ffffff" size={24} />;
  }
  return <PiFileFill color="#808080" size={24} />;
};

const itemsSend: {
  value: "files" | "images" | "videos" | "audios_live" | "audios";
  desc: string;
  icon: React.ReactNode;
  disabled?: boolean;
}[] = [
  {
    value: "files",
    desc: "Enviar documentos",
    icon: <PiFile className="dark:text-[#999999] text-teal-700" size={27} />,
  },
  {
    value: "images",
    desc: "Enviar imagens",
    icon: <MdOutlineImage className="dark:text-[#6daebe]" size={27} />,
  },
  {
    value: "videos",
    desc: "Enviar vídeos",
    icon: <PiFileVideoFill className="dark:text-[#8eb87a]" size={27} />,
  },
  {
    value: "audios_live",
    desc: "Enviar áudios",
    icon: <VscMic className="dark:text-[#0dacd4] text-teal-700" size={27} />,
    disabled: true,
  },
  {
    value: "audios",
    desc: "Enviar áudios",
    icon: (
      <TbHeadphones className="dark:text-[#daa557] text-teal-700" size={27} />
    ),
    disabled: true,
  },
];

// const itemsReply = [
//   {
//     value: "add_vars",
//     desc: "Atribuir variáveis",
//     icon: (
//       <PiBracketsCurlyBold
//         className="dark:text-green-300 text-green-800"
//         size={26.8}
//       />
//     ),
//   },
//   {
//     value: "add_tags",
//     desc: "Adicionar etiquetas",
//     icon: <TbTags className="dark:text-green-300" size={26.8} />,
//   },
//   {
//     value: "remove_tags",
//     desc: "Remover etiquetas",
//     icon: <TbTags className="dark:text-red-300 text-red-800" size={26.8} />,
//   },
//   {
//     value: "remove_vars",
//     desc: "Remover variáveis",
//     icon: (
//       <PiBracketsCurlyBold
//         className="dark:text-red-300 text-red-800"
//         size={26.8}
//       />
//     ),
//   },
//   {
//     value: "notify_wa",
//     desc: "Notificar WhatsApp",
//     icon: (
//       <MdOutlineNotificationsActive
//         className="dark:text-green-500 text-green-600"
//         size={26.8}
//       />
//     ),
//   },
//   {
//     value: "time",
//     desc: "Pausar por um tempo",
//     icon: (
//       <LiaHourglassHalfSolid
//         className="dark:text-zinc-400 text-zinc-700"
//         size={26.8}
//       />
//     ),
//   },
//   {
//     value: "if",
//     desc: "Verificar e executar regras lógicas",
//     icon: (
//       <div className="relative  text-nowrap translate-y-0.5 py-[5px] text-xs font-bold dark:text-yellow-300 text-yellow-600">
//         {"if (..)"}
//       </div>
//     ),
//   },
//   {
//     value: "next",
//     desc: "Continuar para a próxima instrução",
//     icon: (
//       <CgArrowBottomLeft
//         className="dark:text-zinc-400 text-zinc-700"
//         size={26.8}
//       />
//     ),
//   },
//   {
//     value: "exit",
//     desc: "Sair",
//     icon: <IoClose className="dark:text-red-400" size={26.8} />,
//   },
// ];

const optionsModels = [
  {
    label: (
      <span>
        o1 <small className="text-white/70">~US$ 60/M</small>{" "}
      </span>
    ),
    value: "o1",
  },
  {
    label: (
      <span>
        o3 <small className="text-white/70">~US$ 40/M</small>
      </span>
    ),
    value: "o3",
  },
  {
    label: (
      <span>
        gpt-4-turbo <small className="text-white/70">~US$ 30/M</small>
      </span>
    ),
    value: "gpt-4-turbo", // não ler arquivos
  },
  {
    label: (
      <span>
        gpt-4o <small className="text-white/70">~US$ 20/M</small>
      </span>
    ),
    value: "gpt-4o",
  },
  {
    label: (
      <span>
        gpt-4.1 <small className="text-white/70">~US$ 8/M</small>
      </span>
    ),
    value: "gpt-4.1",
  },
  {
    label: (
      <span>
        o4-mini <small className="text-white/70">~US$ 4.4/M</small>
      </span>
    ),
    value: "o4-mini",
  },
  {
    label: (
      <span>
        o3-mini <small className="text-white/70">~US$ 4.4/M</small>
      </span>
    ),
    value: "o3-mini",
  },
];

const optionsEmojiLevel = [
  { label: "None", value: "none" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const ModalCreateAgentAI: React.FC<Props> = (props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<
    "secret-key" | "persona" | "engine"
  >("secret-key");

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
    getValues,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const {
    fields: fieldFiles,
    append: appendFiles,
    remove: removeFiles,
  } = useFieldArray({
    control,
    name: "files",
  });

  const {
    fields: fieldInstructions,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: "instructions",
  });

  const { mutateAsync: createAgentAI, isPending } = useCreateAgentAI({
    setError,
  });

  const create = useCallback(
    async ({ files, instructions, ...fields }: Fields): Promise<void> => {
      try {
        const agentAI = await createAgentAI({
          ...fields,
          files: files?.map((file) => file.id),
          instructions: instructions?.map((instruction) => ({
            prompt: instruction.prompt?.trim(),
            promptAfterReply: instruction.promptAfterReply?.trim(),
            files: instruction.files?.map((file) => file.id),
          })),
        });
        reset();
        props.onCreate?.({ ...agentAI, name: fields.name });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    []
  );

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
      size={"md"}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        w={"460px"}
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar agente IA</DialogTitle>
          <DialogDescription>
            Autônomos que usam IA para realizar tarefas.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt={"-5px"}>
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
                  value="secret-key"
                  py={"27px"}
                >
                  Integração secret key
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="persona"
                  py={"27px"}
                >
                  Configuração de personalidade
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="engine"
                  py={"27px"}
                >
                  Motor de aprendizado
                </TabsTrigger>
              </TabsList>
            </Center>
            <TabsContent value="secret-key" mt={-3}>
              <VStack gap={4}>
                <Field
                  invalid={!!errors.providerCredentialId}
                  label="Selecione o provedor"
                  className="w-full"
                  errorText={errors.providerCredentialId?.message}
                >
                  <Controller
                    name="providerCredentialId"
                    control={control}
                    render={({ field }) => (
                      <SelectBusinesses
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
                        placeholder="Selecione um provedor"
                        setError={({ name, message }) => {
                          if (name === "name") {
                            setError("providerCredentialId", { message });
                          }
                        }}
                        value={field.value}
                      />
                    )}
                  />
                </Field>

                <span className="text-white/70">Ou</span>
                <VStack gap={3}>
                  <Field
                    errorText={errors.apiKey?.message}
                    invalid={!!errors.apiKey}
                    label="Adicione um novo provedor OpenAI"
                    helperText="Suas chaves secretas ficam na aba 'Configurações' do seu perfil."
                  >
                    <Input
                      {...register("apiKey", {
                        onChange(event) {
                          setValue("apiKey", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite a chave secreta da API OpenAI"
                    />
                  </Field>
                  <Field
                    errorText={errors.nameProvider?.message}
                    invalid={!!errors.nameProvider}
                    label="Dê um nome para o provedor"
                    helperText="Não é o nome do agente IA e não será exibido para os usuários."
                  >
                    <Input
                      {...register("nameProvider", {
                        onChange(event) {
                          setValue("nameProvider", event.target.value);
                        },
                      })}
                      autoComplete="off"
                    />
                  </Field>
                </VStack>
              </VStack>
            </TabsContent>
            <TabsContent value="persona" mt={-3}>
              <VStack gap={4}>
                <Field
                  invalid={!!errors.businessIds}
                  label="Anexe projetos"
                  className="w-full"
                  errorText={errors.businessIds?.message}
                  required
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
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome do agente IA"
                  required
                >
                  <Input
                    {...register("name", {
                      onChange(event) {
                        setValue("name", event.target.value);
                      },
                    })}
                    autoComplete="off"
                    placeholder="Digite o nome do agente IA"
                  />
                </Field>
                <div className="w-full flex gap-x-4">
                  <Field
                    invalid={!!errors.emojiLevel}
                    label="Nível de emojis"
                    helperText="Quantidade de emojis que usará em suas respostas."
                    className="w-full"
                    errorText={errors.emojiLevel?.message}
                  >
                    <Controller
                      name="emojiLevel"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          placeholder="None, Low, Medium..."
                          isMulti={false}
                          onBlur={field.onBlur}
                          options={optionsEmojiLevel}
                          isClearable={false}
                          onChange={(e: any) => {
                            field.onChange(e.value);
                          }}
                          value={
                            field.value
                              ? {
                                  label: optionsEmojiLevel.find(
                                    (item) => item.value === field.value
                                  )?.label,
                                  value: field.value,
                                }
                              : null
                          }
                        />
                      )}
                    />
                  </Field>
                  <Field
                    invalid={!!errors.language}
                    label="Linguagem"
                    helperText="Selecione o idioma que o agente usará. padrão é PT-BR."
                    className="w-full"
                    disabled
                    errorText={errors.language?.message}
                  >
                    <Controller
                      name="language"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          placeholder="PT-BR"
                          isMulti={false}
                          isDisabled
                          onBlur={field.onBlur}
                          options={[]}
                          isClearable={false}
                        />
                      )}
                    />
                  </Field>
                </div>
                <Field
                  label="Personalidade do agente IA"
                  errorText={errors.personality?.message}
                  invalid={!!errors.personality}
                  className="w-full"
                >
                  <TextareaAutosize
                    placeholder="Você é um assistente útil e amigável, sempre pronto para ajudar os usuários com suas perguntas e preocupações."
                    style={{ resize: "none" }}
                    minRows={3}
                    maxRows={6}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    {...register("personality")}
                  />
                </Field>
              </VStack>
            </TabsContent>
            <TabsContent value="engine" mt={-3}>
              <VStack gap={4}>
                <div className="w-full flex gap-x-4">
                  <Field
                    errorText={errors.model?.message}
                    invalid={!!errors.model}
                    label="Model AI"
                    helperText="Selecione o modelo de IA que o agente usará."
                    required
                  >
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          placeholder="Selecione o modelo"
                          isMulti={false}
                          onBlur={field.onBlur}
                          options={optionsModels}
                          isClearable={false}
                          onChange={(e: any) => {
                            field.onChange(e.value);
                          }}
                          value={
                            field.value
                              ? {
                                  label: optionsModels.find(
                                    (item) => item.value === field.value
                                  )?.label,
                                  value: field.value,
                                }
                              : null
                          }
                        />
                      )}
                    />
                  </Field>
                  <Field
                    invalid={!!errors.temperature}
                    label="Temperatura"
                    helperText="Controla a aleatoriedade das respostas do agente."
                    className="w-full"
                    errorText={errors.temperature?.message}
                  >
                    <NumberInput.Root
                      // @ts-expect-error
                      min={0}
                      // @ts-expect-error
                      max={1}
                      size={"md"}
                      {...register("temperature")}
                    >
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field>
                </div>

                <span className="block w-full border-b-2 border-zinc-200/20" />
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-center">
                    Cérebro / Base de conhecimento
                  </span>
                  <span className="text-center text-white/70">
                    Você pode adicionar documentos de texto mais detalhados para
                    que o agente use como base de conhecimento.
                  </span>
                </div>

                <div className="w-full flex flex-col gap-y-2">
                  <Field
                    errorText={errors.knowledgeBase?.message}
                    invalid={!!errors.knowledgeBase}
                    className="w-full"
                    helperText=""
                  >
                    <TextareaAutosize
                      placeholder={"Prompt"}
                      style={{ resize: "none" }}
                      minRows={2}
                      maxRows={16}
                      className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                      {...register("knowledgeBase")}
                    />
                  </Field>
                  <div className="grid w-full grid-cols-4 gap-1.5">
                    {fieldFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center flex-col w-full relative"
                      >
                        <a
                          onClick={() => removeFiles(index)}
                          className="absolute hover:text-red-500 duration-200 cursor-pointer top-1 right-1"
                        >
                          <IoClose size={20} />
                        </a>
                        <div
                          style={{
                            border: "2px solid #444444 ",
                          }}
                          className="w-full h-20 overflow-hidden object-center origin-center bg-center flex items-center justify-center rounded-sm"
                        >
                          {/^image\//.test(file.fileName || "") ? (
                            <Image
                              w="100%"
                              h="auto"
                              src={
                                api.getUri() +
                                "/public/storage/" +
                                file.fileName
                              }
                              fetchPriority="low"
                            />
                          ) : (
                            <IconPreviewFile mimetype={file.mimetype || ""} />
                          )}
                        </div>
                        <span className="line-clamp-2 text-xs text-center font-light">
                          {file.originalName}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ModalStorageFiles
                    onSelected={(files) => {
                      removeFiles();
                      appendFiles(files);
                    }}
                    mimetype={["text/", "application/pdf"]}
                  >
                    <Button size={"sm"}>Selecionar os documentos</Button>
                  </ModalStorageFiles>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-semibold text-center">
                    Sequência guiada de ações
                  </span>
                  <span className="text-center text-white/70">
                    Crie instruções na sequência que o agente deve seguir. É
                    importante que as instruções sejam claras e objetivas.
                  </span>
                </div>

                {fieldInstructions.map((instruction, index) => (
                  <div
                    key={instruction.id}
                    className="flex items-start gap-2 w-full"
                  >
                    <Button
                      size={"xs"}
                      colorPalette={"red"}
                      variant={"surface"}
                      onClick={() => remove(index)}
                    >
                      <RiDeleteBin7Line color="#d62d2d" />
                    </Button>
                    <div className="w-full flex flex-col gap-y-2">
                      <Field
                        label="Prompt"
                        errorText={
                          errors.instructions?.[index]?.prompt?.message
                        }
                        invalid={!!errors.instructions?.[index]?.prompt}
                        className="w-full"
                      >
                        <Controller
                          control={control}
                          name={`instructions.${index}.prompt`}
                          defaultValue={instruction.prompt}
                          render={({ field }) => (
                            <TextareaAutosize
                              placeholder={`Pergunte o nome do contato.
Exemplo de pergunta esperada: "Olá, tudo bem? Como posso te chamar?"`}
                              style={{ resize: "none" }}
                              minRows={2}
                              autoFocus
                              name={field.name}
                              value={field.value}
                              maxRows={6}
                              className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </Field>
                      <div className="w-full flex flex-col items-center gap-y-0.5">
                        {!instruction.files?.length && (
                          <span className="text-white/70">
                            Envie documentos... junto com a mensagem do agente.
                          </span>
                        )}
                        {!!instruction.files?.length && (
                          <div className="grid w-full grid-cols-4 gap-1.5 mb-1">
                            {instruction.files?.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center flex-col w-full relative"
                              >
                                <a
                                  onClick={() => {
                                    console.log(instruction);
                                    update(index, {
                                      prompt: instruction.prompt,
                                      promptAfterReply:
                                        instruction.promptAfterReply,
                                      files: instruction.files?.filter(
                                        (f) => f.id !== file.id
                                      ),
                                    });
                                  }}
                                  className="absolute hover:text-red-500 duration-200 cursor-pointer top-1 right-1"
                                >
                                  <IoClose size={20} />
                                </a>
                                <div
                                  style={{
                                    border: "2px solid #444444 ",
                                  }}
                                  className="w-full h-20 overflow-hidden object-center origin-center bg-center flex items-center justify-center rounded-sm"
                                >
                                  {/^image\//.test(file.mimetype || "") ? (
                                    <Image
                                      w="100%"
                                      h="auto"
                                      src={
                                        api.getUri() +
                                        "/public/storage/" +
                                        file.fileName
                                      }
                                      fetchPriority="low"
                                    />
                                  ) : (
                                    <IconPreviewFile
                                      mimetype={file.mimetype || ""}
                                    />
                                  )}
                                </div>
                                <span className="line-clamp-2 text-xs text-center font-light">
                                  {file.originalName}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="grid w-full grid-cols-5 justify-between gap-2">
                          {itemsSend.map((item) => {
                            let mimetype: string | undefined = undefined;
                            if (item.value === "files") {
                              mimetype = undefined;
                            } else if (item.value === "images") {
                              mimetype = "image/";
                            } else if (item.value === "videos") {
                              mimetype = "video/";
                            } else if (item.value === "audios_live") {
                              mimetype = "audio/";
                            } else if (item.value === "audios") {
                              mimetype = "audio/";
                            }
                            return item.disabled ? (
                              <Button
                                variant={"outline"}
                                className="w-full"
                                disabled
                              >
                                {item.icon}
                              </Button>
                            ) : (
                              <ModalStorageFiles
                                onSelected={(files) => {
                                  update(index, { ...instruction, files });
                                }}
                                // @ts-expect-error
                                mimetype={[mimetype]}
                              >
                                <Button variant={"outline"} className="w-full">
                                  {item.icon}
                                </Button>
                              </ModalStorageFiles>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-y-0.5 mt-1">
                        <Field
                          label="O que o agente deve fazer após receber a resposta?"
                          errorText={
                            errors.instructions?.[index]?.promptAfterReply
                              ?.message
                          }
                          invalid={
                            !!errors.instructions?.[index]?.promptAfterReply
                          }
                          className="w-full"
                        >
                          <Controller
                            control={control}
                            name={`instructions.${index}.promptAfterReply`}
                            defaultValue={instruction.prompt}
                            render={({ field }) => (
                              <TextareaAutosize
                                name={field.name}
                                value={field.value}
                                placeholder={`- Se o usuário responder com o nome, atribua a variável "NOME_LEAD" com o valor da resposta.`}
                                style={{ resize: "none" }}
                                minRows={2}
                                maxRows={6}
                                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            )}
                          />
                        </Field>
                      </div>
                      {fieldInstructions.length - 1 !== index && (
                        <div className="flex justify-center">
                          <BsCaretDownFill color="#dddddd7f" size={22} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div
                  className="w-full"
                  style={{
                    paddingLeft: fieldInstructions.length ? "46px" : "",
                  }}
                >
                  <Button
                    onClick={() => {
                      setTimeout(() => {
                        document
                          .querySelector(".chakra-dialog__positioner")
                          ?.scrollBy({
                            top: 390,
                            behavior: "smooth",
                          });
                      }, 100);
                      append({ prompt: "", files: [], promptAfterReply: "" });
                    }}
                    size={"sm"}
                    colorPalette={"green"}
                    w={"full"}
                  >
                    Adicionar {fieldInstructions.length > 0 ? "próxima" : ""}{" "}
                    instrução
                  </Button>
                </div>
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
          {currentTab === "secret-key" && (
            <Button
              type="button"
              onClick={() => setCurrentTab("persona")}
              colorPalette={"cyan"}
              disabled={isPending}
            >
              Avançar
            </Button>
          )}
          {currentTab === "persona" && (
            <>
              <Button
                type="button"
                onClick={() => setCurrentTab("secret-key")}
                colorPalette={"cyan"}
                disabled={isPending}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentTab("engine")}
                colorPalette={"cyan"}
                disabled={isPending}
              >
                Avançar
              </Button>
            </>
          )}
          {currentTab === "engine" && (
            <>
              <Button
                type="button"
                onClick={() => setCurrentTab("persona")}
                colorPalette={"cyan"}
                disabled={isPending}
              >
                Voltar
              </Button>
            </>
          )}
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
};
