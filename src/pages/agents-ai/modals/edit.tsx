import {
  Button,
  Center,
  Image,
  Input,
  NumberInput,
  VStack,
} from "@chakra-ui/react";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../../../services/api";
import { AxiosError } from "axios";
import SelectComponent from "../../../components/Select";
import TextareaAutosize from "react-textarea-autosize";
import { v4 } from "uuid";
import { IoClose } from "react-icons/io5";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { AuthContext } from "@contexts/auth.context";
import { SocketContext } from "@contexts/socket.context";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import { Field } from "@components/ui/field";
import SelectProviders from "@components/SelectProviders";
import SelectBusinesses from "@components/SelectBusinesses";
import { RxLapTimer } from "react-icons/rx";
import { Tooltip } from "@components/ui/tooltip";
import { IoMdImage } from "react-icons/io";
import {
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import AutocompleteTextField from "@components/Autocomplete";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { CloseButton } from "@components/ui/close-button";
import { useGetAgentAI, useUpdateAgentAI } from "../../../hooks/agentAI";

interface Props {
  id: number;
  close: () => void;
}

const toNumberOrUndef = (v: unknown) => {
  if (typeof v === "number") return Number.isNaN(v) ? undefined : v;
  if (typeof v === "string" && v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export const FormSchema = z
  .object({
    providerCredentialId: z.number().optional(),
    apiKey: z.string().optional(),
    nameProvider: z.string().optional(),

    businessIds: z
      .array(z.number(), { message: "Campo obrigatório" })
      .min(1, { message: "Campo obrigatório" }),
    name: z
      .string({ message: "Campo obrigatório" })
      .trim()
      .min(1, { message: "Campo obrigatório" }),
    emojiLevel: z.enum(["none", "low", "medium", "high"]).optional(),
    language: z.string().optional(),
    personality: z
      .string()
      .transform((value) => value.trim() || undefined)
      .optional(),
    model: z
      .string({ message: "Campo obrigatório" })
      .min(1, { message: "Campo obrigatório" }),
    temperature: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(2).optional()
    ),

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
    instructions: z.string().optional(),
    debounce: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(9).optional()
    ),
    timeout: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(999).optional()
    ),
  })
  .superRefine((data, ctx) => {
    const hasId = data.providerCredentialId !== undefined;
    const hasKey = (data.apiKey?.trim() ?? "") !== "";

    if (!hasId && !hasKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o provedor OU a chave secreta.",
        path: ["providerCredentialId"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a chave secreta OU o provedor.",
        path: ["apiKey"],
      });
    }

    if (hasId && hasKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preencha somente um deles (não os dois).",
        path: ["providerCredentialId", "apiKey"],
      });
    }
  });

export type Fields = z.infer<typeof FormSchema>;

const itemsCorporation = [
  { name: "[atribuir_variavel, <Nome da variavel>, <Qual o valor?>" },
  { name: "[add_var, <Nome da variavel>, <Qual o valor?>" },
  { name: "[remove_variavel, <Nome da variavel>" },
  { name: "[remove_var, <Nome da variavel>" },
  { name: "[add_tag, <Nome da etiqueta>" },
  { name: "[add_etiqueta, <Nome da etiqueta>" },
  { name: "[remove_tag, <Nome da etiqueta>" },
  { name: "[remove_etiqueta, <Nome da etiqueta>" },
  { name: "[notificar_wa, <Número de WhatsApp>, <Mensagem>" },
  { name: '[notify_wa, <999999999>, "<MSG>"' },
  { name: "[pausar, <VALOR>, <Qual o tipo de tempo?>" },
  // { name: '[if, ""' },
  // { name: "[sair_node, <Nome da saída>" },
];

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

const optionsModels = [
  {
    label: (
      <span>
        o1 <small className="text-white/70">~US$ 60/M</small>{" "}
      </span>
    ),
    value: "o1",
    isDisabled: true,
  },
  {
    label: (
      <span>
        o3 <small className="text-white/70">~US$ 40/M</small>
      </span>
    ),
    value: "o3",
    isDisabled: true,
  },
  {
    label: (
      <span>
        gpt-4-turbo <small className="text-white/70">~US$ 30/M</small>
      </span>
    ),
    value: "gpt-4-turbo", // não ler arquivos
    isDisabled: true,
  },
  {
    label: (
      <span>
        gpt-4o <small className="text-white/70">~US$ 20/M</small>
      </span>
    ),
    value: "gpt-4o",
    isDisabled: true,
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
    isDisabled: true,
  },
  {
    label: (
      <span>
        o3-mini <small className="text-white/70">~US$ 4.4/M</small>
      </span>
    ),
    value: "o3-mini",
    isDisabled: true,
  },
];

const optionsEmojiLevel = [
  { label: "None", value: "none" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

type Message = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
};

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const { logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [errorDraft, setErrorDraft] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "secret-key" | "persona" | "engine"
  >("secret-key");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
    getValues,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { providerCredentialId: undefined, apiKey: undefined },
  });
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const { data } = useGetAgentAI(id);

  useEffect(() => {
    if (data) {
      const { instructions, knowledgeBase, personality, ...d } = data;
      reset({
        ...d,
        instructions: instructions || undefined,
        knowledgeBase: knowledgeBase || undefined,
        personality: personality || undefined,
      });
    }
  }, [data, reset]);

  const {
    fields: fieldFiles,
    append: appendFiles,
    remove: removeFiles,
  } = useFieldArray({
    control,
    name: "files",
  });

  const providerCredentialId = watch("providerCredentialId");
  const apiKey = watch("apiKey");
  const instructions = watch("instructions");

  const { mutateAsync: updateAgentAI, isPending } = useUpdateAgentAI({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const edit = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await updateAgentAI({ id, body: fields });
      reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const tokenTest = useMemo(() => {
    return v4();
  }, []);

  const clearTokenTest = () => {
    if (tokenTest) {
      socket.emit("agent-ai:clear-tokenTest", tokenTest);
    }
  };

  const onError = (errs: typeof errors) => {
    if (errs.apiKey || errs.providerCredentialId || errs.nameProvider) {
      setCurrentTab("secret-key");
      return;
    }
    if (
      errs.businessIds ||
      errs.name ||
      errs.emojiLevel ||
      errs.language ||
      errs.personality
    ) {
      setCurrentTab("persona");
      return;
    }
    setCurrentTab("engine");
  };

  const sendMessage = useCallback(
    async (fields: Fields) => {
      try {
        if (!draft.trim()) return;
        setMessages((prev) => [
          ...prev,
          { id: v4(), role: "user", content: draft },
        ]);
        setDraft("");
        const {
          businessIds,
          timeout,
          files,
          debounce,
          nameProvider,
          ...restf
        } = fields;
        const { data } = await api.post("/private/agents-ai/test", {
          ...restf,
          files: files?.map((file) => file.id),
          content: draft.trim(),
          tokenTest: tokenTest,
        });
        for await (const content of data.actions) {
          setMessages((prev) => [
            ...prev,
            { id: v4(), role: "system", content },
          ]);
          await new Promise((resolve) => setTimeout(resolve, 220));
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        for await (const content of data.content) {
          setMessages((prev) => [
            ...prev,
            { id: v4(), role: "agent", content },
          ]);
          await new Promise((resolve) => setTimeout(resolve, 220));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) => {
                if (path === "draft") {
                  setErrorDraft(text);
                } else {
                  // @ts-expect-error
                  props?.setError?.(path, { message: text });
                }
              });
            }
          }
        }
      }
    },
    [tokenTest, apiKey, providerCredentialId, draft]
  );

  return (
    <form onSubmit={handleSubmit(edit, onError)}>
      <DialogBody mt={"-5px"}>
        <div className="grid grid-cols-[412px_1fr] gap-x-3 relative">
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
                      <SelectProviders
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
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
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
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
                      max={2}
                      size={"md"}
                      {...register("temperature")}
                    >
                      <NumberInput.Input placeholder="0 - 1" />
                    </NumberInput.Root>
                  </Field>
                  <Field
                    errorText={errors.timeout?.message}
                    invalid={!!errors.timeout}
                    label={
                      <div className="flex flex-col -space-y-1">
                        <span>Tempo esperando resposta</span>
                        <span className="text-white/60 font-light">
                          *Funciona apenas em chat real
                        </span>
                      </div>
                    }
                    helperText={
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="">Caso o tempo limite se esgote</span>
                        <span className="flex items-center gap-x-1">
                          sairá pelo canal Node:{" "}
                          <RxLapTimer
                            size={16}
                            className="dark:text-red-400 text-red-500 -translate-y-0.5"
                          />
                        </span>
                      </div>
                    }
                  >
                    <NumberInput.Root
                      // @ts-expect-error
                      min={0}
                      // @ts-expect-error
                      max={7200}
                      size={"md"}
                      {...register("timeout")}
                    >
                      <NumberInput.Input placeholder="900 (20 Minutos)" />
                    </NumberInput.Root>
                  </Field>
                  <Field
                    errorText={errors.debounce?.message}
                    invalid={!!errors.debounce}
                    label={
                      <div className="flex flex-col -space-y-1">
                        <span>Debounce</span>
                        <span className="text-white/60 font-light">
                          *Funciona apenas em chat real
                        </span>
                      </div>
                    }
                    helperText={
                      <div>
                        <Tooltip content="Isso evita floods e garante que o contato terminou de enviar todas as mensagens">
                          <span className="line-clamp-2 leading-5 ">
                            Isso evita floods e garante que o contato terminou
                            de enviar todas as mensagens
                          </span>
                        </Tooltip>
                      </div>
                    }
                  >
                    <NumberInput.Root
                      // @ts-expect-error
                      min={0}
                      // @ts-expect-error
                      max={9}
                      size={"md"}
                      {...register("debounce")}
                    >
                      <NumberInput.Input placeholder="9 segundos" />
                    </NumberInput.Root>
                  </Field>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-semibold text-center">
                    Cérebro / Base de conhecimento
                  </span>
                  <span className="text-center text-white/70 px-3">
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
                    Instruções do agente
                  </span>
                  <span className="text-center text-white/70 px-7">
                    Instruções do que o agente deve fazer. É importante que as
                    instruções sejam claras e objetivas.
                  </span>
                </div>

                <div className="w-full flex flex-col gap-y-2">
                  <AutocompleteTextField
                    // @ts-expect-error
                    trigger={["/"]}
                    maxOptions={20}
                    matchAny
                    options={{
                      "/": itemsCorporation.map((s) => s.name),
                    }}
                    maxRows={20}
                    minRows={8}
                    value={instructions}
                    spacer={"] "}
                    type="textarea"
                    placeholder={`- Quando iniciar a conversa /[add_etiqueta, LEAD_FRIO]`}
                    onChange={(s: string) => {
                      setValue("instructions", s);
                    }}
                  />
                  <span className="text-white/70">
                    Digite <strong className="text-green-400">/</strong> para
                    abrir o menu de ferramentas.
                  </span>
                </div>

                {/* <div className="flex flex-col items-center">
                            <span className="font-semibold text-center">
                              Instruções do agente
                            </span>
                            <span className="text-center text-white/70 px-7">
                              Crie instruções que o agente deve seguir. É importante que
                              as instruções sejam claras e objetivas.
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
                                      Envie documentos... junto com a mensagem do
                                      agente.
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
                                          <Button
                                            variant={"outline"}
                                            className="w-full"
                                          >
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
                                          onChange={(e) =>
                                            field.onChange(e.target.value)
                                          }
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
                            className="w-full flex flex-col gap-y-2"
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
        
                            {!!fieldInstructions.length && (
                              <Field
                                label="O que fazer após concluir todas as instruções?"
                                // errorText={
                                //   errors.instructions?.[index]?.promptAfterReply
                                //     ?.message
                                // }
                                // invalid={
                                //   !!errors.instructions?.[index]?.promptAfterReply
                                // }
                                className="w-full mt-3"
                              >
                                <Controller
                                  control={control}
                                  name="apiKey"
                                  // name={`instructions.${index}.promptAfterReply`}
                                  // defaultValue={instruction.prompt}
                                  render={({ field }) => (
                                    <TextareaAutosize
                                      name={field.name}
                                      value={field.value}
                                      placeholder={`Continue o fluxo`}
                                      style={{ resize: "none" }}
                                      minRows={2}
                                      maxRows={6}
                                      className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  )}
                                />
                              </Field>
                            )}
                          </div> */}
              </VStack>
            </TabsContent>
          </TabsRoot>
          <div className="h-full flex gap-y-2 flex-col max-h-[calc(100vh-230px)] sticky top-3">
            {!!messages.length && (
              <a
                onClick={() => {
                  clearTokenTest();
                  setMessages([]);
                }}
                className="text-sm text-white/50 hover:text-white duration-200 cursor-pointer text-center"
              >
                Limpar histórico
              </a>
            )}
            <div className="flex flex-col flex-1 bg-zinc-400/5 rounded-md">
              <Virtuoso
                ref={virtuosoRef}
                data={messages}
                className="scroll-custom-table"
                followOutput="smooth"
                itemContent={(_, msg) => {
                  if (msg.role === "system") {
                    return (
                      <div className="px-2 py-1.5 text-sm text-center opacity-20">
                        <span
                          className={`inline-block w-full break-words rounded-md font-semibold whitespace-pre-wrap px-1.5 py-1 bg-yellow-200/20 text-white`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </span>
                      </div>
                    );
                  }
                  if (msg.role === "agent") {
                    return (
                      <div className="px-2 py-1.5 text-sm text-left">
                        <span
                          className={`inline-block max-w-[80%] break-words rounded-md whitespace-pre-wrap px-1.5 py-1 bg-zinc-700/70 text-white`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="px-2 py-1.5 text-sm text-right">
                      <span
                        className={`inline-block max-w-[80%] break-words rounded-md whitespace-pre-wrap px-1.5 py-1 bg-teal-700 text-white`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </span>
                    </div>
                  );
                }}
              />
            </div>
            <div className="flex flex-col">
              <TextareaAutosize
                placeholder="Enviar mensagem"
                style={{ resize: "none" }}
                minRows={1}
                maxRows={6}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (draft.trim()) {
                      handleSubmit(sendMessage, onError)();
                    }
                  }
                }}
              />
              <span className="text-xs text-center text-white/50">
                Teste seu agente IA.
              </span>
              {errorDraft && (
                <span className="text-red-500 text-xs text-center">
                  Error interno ao processar o teste
                </span>
              )}
            </div>
          </div>
        </div>
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
        <Button
          type="submit"
          loading={isPending}
          disabled={isPending || isSubmitting}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModalEditAgentAI(props: Props): JSX.Element {
  return (
    <DialogContent w={"760px"} backdrop>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar agente IA</DialogTitle>
        <DialogDescription>
          Autônomos que usam IA para realizar tarefas.
        </DialogDescription>
      </DialogHeader>
      <Content id={props.id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
