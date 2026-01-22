import {
  Button,
  Center,
  Checkbox,
  HStack,
  IconButton,
  Input,
  NumberInput,
  Text,
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
import { api } from "../../../../services/api";
import { AxiosError } from "axios";
import SelectComponent from "../../../../components/Select";
import TextareaAutosize from "react-textarea-autosize";
import { v4 } from "uuid";
// import { IoClose } from "react-icons/io5";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
// import SelectBusinesses from "@components/SelectBusinesses";
import { RxLapTimer } from "react-icons/rx";
import { Tooltip } from "@components/ui/tooltip";
// import { IoMdImage } from "react-icons/io";
// import {
//   PiFileAudioFill,
//   PiFileFill,
//   PiFilePdfFill,
//   PiFileTextFill,
//   PiFileVideoFill,
// } from "react-icons/pi";
// import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ErrorResponse_I } from "../../../../services/api/ErrorResponse";
import { CloseButton } from "@components/ui/close-button";
import { useGetAgentAI, useUpdateAgentAI } from "../../../../hooks/agentAI";
import { useHookFormMask } from "use-mask-input";
import { FaWhatsapp } from "react-icons/fa";
import { Avatar } from "@components/ui/avatar";
import {
  MdHorizontalRule,
  MdOutlineDeleteOutline,
  MdOutlineModeEdit,
} from "react-icons/md";
import { GrClose } from "react-icons/gr";
import {
  getConnectionWA,
  updateConnectionWA,
} from "../../../../services/api/ConnectionWA";
import { getChatbot, updateChatbot } from "../../../../services/api/Chatbot";
import { RiSendPlane2Line } from "react-icons/ri";

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

const FormSchemaChatbot = z.object({
  fallback: z
    .string()
    .optional()
    .transform((v) => v || undefined),

  operatingDays: z
    .array(
      z.object({
        dayOfWeek: z.number(),
        workingTimes: z
          .array(z.object({ start: z.string(), end: z.string() }))
          .optional(),
      }),
    )
    .optional(),
});

const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

const FormSchemaConnectionWA = z.object({
  profileName: z.string().optional(),
  profileStatus: z.string().optional(),
  lastSeenPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional(),
  onlinePrivacy: z.enum(["all", "match_last_seen"]).optional(),
  imgPerfilPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional(),
  statusPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional(),
  groupsAddPrivacy: z.enum(["all", "contacts", "contact_blacklist"]).optional(),
  readReceiptsPrivacy: z.enum(["all", "none"]).optional(),
  fileImage: z.instanceof(File).optional(),
});

const optionsPrivacyValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  { label: "Ninguém", value: "none" },
];

const optionsPrivacyGroupValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  // { label: "Ninguém", value: "none" },
];

export const FormSchema = z
  .object({
    providerCredentialId: z.number().optional(),
    apiKey: z.string().optional(),
    nameProvider: z.string().optional(),

    businessIds: z
      .array(z.number(), { message: "Campo obrigatório." })
      .min(1, { message: "Campo obrigatório." }),
    name: z
      .string({ message: "Campo obrigatório." })
      .trim()
      .min(1, { message: "Campo obrigatório." }),
    emojiLevel: z.enum(["none", "low", "medium", "high"]).optional(),
    language: z.string().optional(),
    personality: z.string().optional(),
    model: z
      .string({ message: "Campo obrigatório." })
      .min(1, { message: "Campo obrigatório." }),
    temperature: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(2).optional(),
    ),

    knowledgeBase: z.string().optional(),
    files: z
      .array(
        z.object({
          id: z.number(),
          fileName: z.string().nullish(),
          originalName: z.string(),
          mimetype: z.string().nullish(),
        }),
      )
      .optional(),
    instructions: z.string().optional(),
    debounce: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(9).optional(),
    ),
    timeout: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(14400).optional(),
    ),
    service_tier: z
      .enum(["default", "flex", "auto", "scale", "priority"])
      .optional(),
    connectionWA: FormSchemaConnectionWA,
    chatbot: FormSchemaChatbot,
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

// const IconPreviewFile = (p: { mimetype: string }): JSX.Element => {
//   if (/^image\//.test(p.mimetype)) {
//     return <IoMdImage color="#6daebe" size={24} />;
//   }
//   if (/^video\//.test(p.mimetype)) {
//     return <PiFileVideoFill color="#8eb87a" size={24} />;
//   }
//   if (/^audio\//.test(p.mimetype)) {
//     return <PiFileAudioFill color="#d4b663" size={24} />;
//   }
//   if (p.mimetype === "application/pdf") {
//     return <PiFilePdfFill color="#db8c8c" size={24} />;
//   }
//   if (/^text\//.test(p.mimetype)) {
//     return <PiFileTextFill color="#ffffff" size={24} />;
//   }
//   return <PiFileFill color="#808080" size={24} />;
// };

const optionsModels = [
  {
    label: <span>gpt-5.2</span>,
    value: "gpt-5.2",
    isFlex: true,
    searchFile: true,
    desc: "O modelo mais avançado para trabalho profissional e agentes de longa duração.",
  },
  {
    label: <span>gpt-5.1</span>,
    value: "gpt-5.1",
    isFlex: true,
    searchFile: true,
    desc: "Altíssimo desempenho; ótimo para trabalhos exigentes.",
  },
  {
    label: <span>gpt-5</span>,
    value: "gpt-5",
    isFlex: true,
    searchFile: true,
    desc: "Muito capaz; atende necessidades profissionais e negócios.",
  },
  {
    label: <span>gpt-5-mini</span>,
    value: "gpt-5-mini",
    isFlex: true,
    searchFile: true,
    desc: "Boa qualidade com menor custo; ideal para uso diário.",
  },
  {
    label: <span>gpt-5-nano</span>,
    value: "gpt-5-nano",
    isFlex: true,
    searchFile: true,
    desc: "Rápido e barato; para tarefas simples e frequentes.",
  },
  {
    label: <span>o3</span>,
    value: "o3",
    isFlex: true,
    searchFile: true,
    desc: "Equilíbrio entre custo e desempenho; confiável para rotinas.",
  },
  {
    label: <span>o4-mini</span>,
    value: "o4-mini",
    isFlex: true,
    searchFile: true,
    desc: "Leve e rápido; bom para respostas rápidas.",
  },
  {
    label: <span>gpt-4.1</span>,
    value: "gpt-4.1",
    isFlex: false,
    searchFile: true,
    desc: "Estável e preciso; ideal para textos longos.",
  },
  {
    label: <span>gpt-4.1-mini</span>,
    value: "gpt-4.1-mini",
    isFlex: false,
    searchFile: true,
    desc: "Boa qualidade por menos custo; para uso constante.",
  },
  {
    label: <span>gpt-4.1-nano</span>,
    value: "gpt-4.1-nano",
    isFlex: false,
    searchFile: true,
    desc: "Muito rápido e econômico; para respostas curtas.",
  },
  {
    label: <span>o3-mini</span>,
    value: "o3-mini",
    isFlex: false,
    searchFile: true,
    desc: "Versão econômica; atende grande volume com custo baixo.",
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
    "secret-key" | "persona" | "engine" | "connection"
  >("secret-key");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty },
    setError,
    watch,
    setValue,
    reset,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { providerCredentialId: undefined, apiKey: undefined },
  });
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const imgProfileRef = useRef<HTMLInputElement>(null);
  const registerWithMask = useHookFormMask(register);
  const [imgPreview, setImgPreview] = useState<string | null | undefined>(null);
  const [tokenTest, setTokenTest] = useState<string>("");
  const [loadSend, setLoadSend] = useState(false);

  const { data } = useGetAgentAI(id);

  useEffect(() => {
    (async () => {
      if (data) {
        const {
          instructions,
          knowledgeBase,
          personality,
          connectionWAId,
          chatbotId,
          ...d
        } = data;

        let connectionWA: any = null;
        let chatbot: any = null;
        if (connectionWAId) {
          const {
            businessId,
            name,
            type,
            description,
            fileImage,
            ...restData
          } = await getConnectionWA(connectionWAId);
          const nextData = Object.entries(restData).reduce(
            (acc, [key, value]) => {
              // @ts-expect-error
              if (value !== null && value !== undefined) acc[key] = value;
              return acc;
            },
            {},
          );
          setImgPreview(fileImage);
          connectionWA = nextData;
        }
        if (chatbotId) {
          const { operatingDays, fallback } = await getChatbot(chatbotId);
          chatbot = {
            operatingDays: operatingDays?.length ? operatingDays : undefined,
            fallback: fallback || undefined,
          };
        }
        reset({
          ...d,
          connectionWA: connectionWA ? connectionWA : undefined,
          chatbot: chatbot ? chatbot : undefined,
          instructions: instructions || undefined,
          knowledgeBase: knowledgeBase || undefined,
          personality: personality || undefined,
        });
      }
    })();
  }, [data, reset]);

  // const {
  //   fields: fieldFiles,
  //   append: appendFiles,
  //   remove: removeFiles,
  // } = useFieldArray({
  //   control,
  //   name: "files",
  // });

  const providerCredentialId = watch("providerCredentialId");
  const apiKey = watch("apiKey");
  const operatingDays = watch("chatbot.operatingDays");
  const fileImage = watch("connectionWA.fileImage");
  const service_tier = watch("service_tier");
  const model = watch("model");

  const optionsOpertaingDaysMemo = useMemo(() => {
    if (!operatingDays?.length) return optionsOpertaingDays;
    const selectedDays = operatingDays.map((day) => day.dayOfWeek);
    return optionsOpertaingDays.filter((s) => !selectedDays.includes(s.value));
  }, [operatingDays?.length]);

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
    if (imgPreview) {
      return `${api.getUri()}/public/images/${imgPreview}`;
    }
  }, [fileImage, imgPreview]);

  const { mutateAsync: updateAgentAI, isPending } = useUpdateAgentAI({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const edit = useCallback(
    async ({ connectionWA, chatbot, ...fields }: Fields): Promise<void> => {
      try {
        if (data?.chatbotId) {
          await updateChatbot(data.chatbotId, chatbot);
        }
        if (data?.connectionWAId) {
          await updateConnectionWA(data.connectionWAId, connectionWA);
        }
        await updateAgentAI({ id, body: fields });
        reset();
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [data?.connectionWAId, data?.chatbotId],
  );

  useEffect(() => {
    setTokenTest(v4());
    return () => {
      setTokenTest("");
    };
  }, []);

  useEffect(() => {
    if (tokenTest && socket) {
      socket.on(
        `test-agent-${tokenTest}`,
        async (data: { role: "agent" | "system"; content: string }) => {
          setMessages((prev) => [...prev, { id: v4(), ...data }]);
        },
      );
    }
    return () => {
      socket.off(`test-agent-${tokenTest}`);
    };
  }, [tokenTest]);

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
          chatbot,
          connectionWA,
          ...restf
        } = fields;
        setLoadSend(true);
        await api.post("/private/agents-ai/test", {
          ...restf,
          files: files?.map((file) => file.id),
          content: draft.trim(),
          tokenTest: tokenTest,
        });
        setLoadSend(false);
      } catch (error) {
        setLoadSend(false);
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
    [tokenTest, apiKey, providerCredentialId, draft],
  );

  return (
    <form onSubmit={handleSubmit(edit, onError)}>
      <DialogBody mt={"-5px"}>
        <div className="grid grid-cols-[422px_1fr] gap-x-3 relative">
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
                  Perfil e aprendizado
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="engine"
                  py={"27px"}
                >
                  Horários de operação
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="connection"
                  py={"27px"}
                >
                  <FaWhatsapp size={40} />
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

                <Field
                  errorText={errors.apiKey?.message}
                  invalid={!!errors.apiKey}
                  label="Adicione um novo provedor OpenAI"
                  helperText="Suas chaves secretas ficam na aba 'Configurações' do seu perfil."
                >
                  <Input
                    {...register("apiKey")}
                    autoComplete="off"
                    placeholder="Digite a chave secreta da API OpenAI"
                  />
                </Field>
                <Field
                  errorText={errors.nameProvider?.message}
                  invalid={!!errors.nameProvider}
                  label="Dê um nome para o provedor"
                  helperText="Não é o nome do assistente e não será exibido para os usuários."
                >
                  <Input {...register("nameProvider")} autoComplete="off" />
                </Field>
              </VStack>
            </TabsContent>
            <TabsContent value="persona" mt={-3}>
              <VStack gap={4}>
                {/* <Field
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
                </Field> */}
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome do agente IA"
                  required
                >
                  <Input
                    {...register("name")}
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
                                    (item) => item.value === field.value,
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

                <div className="w-full h-px my-3 bg-gray-200/10"></div>

                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div className="space-y-2">
                    <Field
                      errorText={errors.model?.message}
                      invalid={!!errors.model}
                      label="Model AI"
                      helperText="Selecione o modelo de IA que o assistente usará."
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
                            options={optionsModels.map((s) => ({
                              label: s.label,
                              value: s.value,
                            }))}
                            isClearable={false}
                            onChange={(e: any) => {
                              field.onChange(e.value);
                            }}
                            value={
                              field.value
                                ? {
                                    label: optionsModels.find(
                                      (item) => item.value === field.value,
                                    )?.label,
                                    value: field.value,
                                  }
                                : null
                            }
                          />
                        )}
                      />
                    </Field>
                    {optionsModels.some(
                      (m) => m.value === model && m.isFlex,
                    ) && (
                      <Field helperText="Barato e com maior latência">
                        <Checkbox.Root
                          checked={service_tier === "flex"}
                          onCheckedChange={(e) =>
                            setValue(
                              "service_tier",
                              e.checked ? "flex" : "default",
                              { shouldDirty: true },
                            )
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>
                            Modo Julius
                            <span className="text-white/60 font-light text-sm">
                              (pai do Chris)
                            </span>
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </Field>
                    )}
                  </div>
                  <Field
                    invalid={!!errors.temperature}
                    label="Temperatura"
                    helperText="Controla a aleatoriedade das respostas do assistente."
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
                </div>
                {model && (
                  <p className="bg-green-100/10 p-1 -mt-1.5 w-full">
                    {optionsModels.find((o) => o.value === model)?.desc}
                  </p>
                )}
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
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
                      max={14400}
                      size={"md"}
                      {...register("timeout")}
                    >
                      <NumberInput.Input placeholder="1200 (20 Minutos)" />
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
                    Você pode adicionar textos mais detalhados para que o
                    assistente use como base de conhecimento.
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
                  {/* <div className="grid w-full grid-cols-4 gap-1.5">
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
                  </ModalStorageFiles> */}
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-semibold text-center">
                    Instruções do assistente
                  </span>
                  <span className="text-center text-white/70 px-7">
                    Instruções do que deve ser feito. É importante que as
                    instruções sejam claras e objetivas.
                  </span>
                </div>

                <div className="w-full flex flex-col gap-y-2">
                  <TextareaAutosize
                    maxRows={20}
                    minRows={8}
                    placeholder={`Quando iniciar a conversa ...`}
                    style={{ resize: "none" }}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    {...register("instructions")}
                  />
                  <span className="text-white/70">
                    Digite <strong className="text-green-400">/</strong> para
                    abrir o menu de ferramentas.
                  </span>
                </div>
              </VStack>
            </TabsContent>
            <TabsContent value="engine" className="min-h-65">
              <div className="-mt-1 flex flex-col gap-4">
                {!operatingDays?.length && (
                  <span className="text-yellow-600 font-semibold text-center">
                    Funciona 24 horas por dia, 7 dias por semana.
                  </span>
                )}
                {!!operatingDays?.length && (
                  <ul className="flex flex-col gap-1.5">
                    {/* Dias de funcionamento */}
                    {operatingDays.map((day, dayIndex) => (
                      <li
                        key={dayIndex}
                        className="flex w-full flex-col"
                        style={{
                          gap: day.workingTimes?.length ? "2px" : "0px",
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <IconButton
                              size={"xs"}
                              variant={"ghost"}
                              type="button"
                              color={"red.100"}
                              _hover={{ color: "red.400" }}
                              onClick={() => {
                                setValue(
                                  "chatbot.operatingDays",
                                  operatingDays.filter(
                                    (o) => o.dayOfWeek !== day.dayOfWeek,
                                  ),
                                );
                              }}
                            >
                              <MdOutlineDeleteOutline />
                            </IconButton>
                            <div className="flex items-center gap-2 pl-1.5">
                              <span className="font-medium block">
                                {optionsOpertaingDays.find(
                                  (op) => op.value === day.dayOfWeek,
                                )?.label || ""}
                              </span>
                              {!day.workingTimes?.length && (
                                <span className="font-light text-yellow-600">
                                  Funciona 24 horas
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-red-400">
                            {errors.chatbot?.operatingDays?.[dayIndex]?.message}
                          </span>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {day.workingTimes?.map((_, timeIndex) => (
                            <li
                              key={timeIndex}
                              className="flex flex-col w-full"
                            >
                              <div className="flex w-full items-center gap-2">
                                <Field
                                  errorText={
                                    errors.chatbot?.operatingDays?.[dayIndex]
                                      ?.workingTimes?.[timeIndex]?.start
                                      ?.message
                                  }
                                  invalid={
                                    !!errors.chatbot?.operatingDays?.[dayIndex]
                                      ?.workingTimes?.[timeIndex]?.start
                                  }
                                >
                                  <Input
                                    placeholder="HH:mm"
                                    step={"60"}
                                    size={"2xs"}
                                    {...registerWithMask(
                                      `chatbot.operatingDays.${dayIndex}.workingTimes.${timeIndex}.start`,
                                      "99:99",
                                    )}
                                  />
                                </Field>
                                <MdHorizontalRule size={33} />
                                <Field
                                  errorText={
                                    errors.chatbot?.operatingDays?.[dayIndex]
                                      ?.workingTimes?.[timeIndex]?.end?.message
                                  }
                                  invalid={
                                    !!errors.chatbot?.operatingDays?.[dayIndex]
                                      ?.workingTimes?.[timeIndex]?.end
                                  }
                                >
                                  <Input
                                    placeholder="HH:mm"
                                    size={"2xs"}
                                    {...registerWithMask(
                                      `chatbot.operatingDays.${dayIndex}.workingTimes.${timeIndex}.end`,
                                      "99:99",
                                    )}
                                  />
                                </Field>
                                <IconButton
                                  size={"xs"}
                                  variant={"ghost"}
                                  type="button"
                                  color={"red.100"}
                                  _hover={{ color: "red.400" }}
                                  onClick={() => {
                                    setValue(
                                      "chatbot.operatingDays",
                                      operatingDays.map((o) => {
                                        if (o.dayOfWeek === day.dayOfWeek) {
                                          o.workingTimes =
                                            o.workingTimes?.filter(
                                              (__, i) => i !== timeIndex,
                                            );
                                        }
                                        return o;
                                      }),
                                    );
                                  }}
                                >
                                  <GrClose />
                                </IconButton>
                              </div>
                              <span className="text-red-400">
                                {
                                  errors.chatbot?.operatingDays?.[dayIndex]
                                    ?.workingTimes?.[timeIndex]?.message
                                }
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div
                          className={
                            day.workingTimes?.length
                              ? "flex justify-center mr-9"
                              : ""
                          }
                        >
                          <Button
                            variant={"plain"}
                            color={"blue.400"}
                            _hover={{ color: "blue.300" }}
                            size={"xs"}
                            className="w-fit"
                            onClick={() => {
                              setValue(
                                "chatbot.operatingDays",
                                operatingDays.map((o) => {
                                  if (o.dayOfWeek === day.dayOfWeek) {
                                    if (o.workingTimes?.length) {
                                      o.workingTimes?.push({
                                        start: "",
                                        end: "",
                                      });
                                    } else {
                                      o.workingTimes = [{ start: "", end: "" }];
                                    }
                                  }
                                  return o;
                                }),
                              );
                            }}
                          >
                            Adicionar horário
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Controller
                  control={control}
                  name="chatbot.operatingDays"
                  render={({ field }) => (
                    <SelectComponent
                      isMulti={false}
                      onBlur={() => {}}
                      name={field.name}
                      isDisabled={field.disabled}
                      ref={field.ref}
                      placeholder="Selecione os dias de funcionamento"
                      onChange={(e: any) => {
                        if (!operatingDays?.length) {
                          field.onChange([
                            { dayOfWeek: e.value, workingTimes: [] },
                          ]);
                        } else {
                          operatingDays?.splice(e.value, 0, {
                            dayOfWeek: e.value,
                            workingTimes: [],
                          });
                          field.onChange(operatingDays);
                        }
                      }}
                      options={optionsOpertaingDaysMemo}
                      value={null}
                    />
                  )}
                />

                <Field
                  label={"Fallback"}
                  errorText={errors.chatbot?.fallback?.message}
                  invalid={!!errors.chatbot?.fallback}
                  className="w-full"
                  helperText="Texto enviado apenas uma vez quando o assistente estiver fora do horário de operação. Se o mesmo estiver ativo, o fallback não será enviado."
                >
                  <TextareaAutosize
                    placeholder=""
                    style={{ resize: "none" }}
                    minRows={2}
                    maxRows={6}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    {...register("chatbot.fallback")}
                  />
                </Field>
              </div>
            </TabsContent>
            <TabsContent value="connection">
              <VStack gap={4}>
                <HStack w={"full"} mb={2} gap={3}>
                  <Tooltip content="Atualizar foto de perfil">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => imgProfileRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={imgProfileRef}
                        hidden
                        className="hidden"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setValue("connectionWA.fileImage", file, {
                              shouldDirty: true,
                            });
                        }}
                      />
                      <Avatar
                        size={"2xl"}
                        width={"90px"}
                        height={"90px"}
                        src={imgPreviewUrl}
                      >
                        <Center className="absolute -bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-emerald-800">
                          <MdOutlineModeEdit size={17} />
                        </Center>
                      </Avatar>
                    </div>
                  </Tooltip>
                  <VStack w={"full"} gap={2}>
                    <Field
                      errorText={errors.connectionWA?.profileName?.message}
                      invalid={!!errors.connectionWA?.profileName}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("connectionWA.profileName")}
                        autoComplete="off"
                        placeholder="Nome do perfil"
                      />
                    </Field>
                    <Field
                      errorText={errors.connectionWA?.profileStatus?.message}
                      invalid={!!errors.connectionWA?.profileStatus}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("connectionWA.profileStatus")}
                        autoComplete="off"
                        placeholder="Recado"
                      />
                    </Field>
                  </VStack>
                </HStack>
                <Text fontWeight={"medium"}>Privacidade</Text>
                <HStack w={"full"}>
                  <Field
                    errorText={errors.connectionWA?.lastSeenPrivacy?.message}
                    invalid={!!errors.connectionWA?.lastSeenPrivacy}
                    label="Visto por último"
                    disabled
                  >
                    <Controller
                      name="connectionWA.lastSeenPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          isDisabled
                          onBlur={field.onBlur}
                          placeholder="Ninguém"
                          onChange={(e: any) => field.onChange(e.value)}
                          // options={optionsPrivacyValue}
                        />
                      )}
                    />
                  </Field>
                  <Field
                    errorText={errors.connectionWA?.onlinePrivacy?.message}
                    invalid={!!errors.connectionWA?.onlinePrivacy}
                    label="Online"
                    disabled
                  >
                    <Controller
                      name="connectionWA.onlinePrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          onBlur={field.onBlur}
                          isDisabled
                          placeholder={'Igual ao "visto por último"'}
                          // options={optionsOnlinePrivacy}
                          onChange={(e: any) => field.onChange(e.value)}
                          // value={field.value}
                        />
                      )}
                    />
                  </Field>
                </HStack>
                <HStack w={"full"}>
                  <Field
                    errorText={errors.connectionWA?.imgPerfilPrivacy?.message}
                    invalid={!!errors.connectionWA?.imgPerfilPrivacy}
                    label="Foto do perfil"
                  >
                    <Controller
                      name="connectionWA.imgPerfilPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          placeholder="Todos"
                          onBlur={field.onBlur}
                          options={optionsPrivacyValue}
                          onChange={(e: any) => field.onChange(e.value)}
                          value={
                            field.value
                              ? {
                                  label:
                                    optionsPrivacyValue.find(
                                      (s) => s.value === field.value,
                                    )?.label || "",
                                  value: field.value,
                                }
                              : null
                          }
                        />
                      )}
                    />
                  </Field>
                  <Field
                    errorText={errors.connectionWA?.statusPrivacy?.message}
                    invalid={!!errors.connectionWA?.statusPrivacy}
                    label="Status"
                    disabled
                  >
                    <Controller
                      name="connectionWA.statusPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          isDisabled
                          onBlur={field.onBlur}
                          placeholder="Meus contatos"
                          onChange={(e: any) => field.onChange(e.value)}
                        />
                      )}
                    />
                  </Field>
                </HStack>
                <HStack w={"full"}>
                  <Field
                    errorText={errors.connectionWA?.groupsAddPrivacy?.message}
                    invalid={!!errors.connectionWA?.groupsAddPrivacy}
                    label="Adicionar aos grupos"
                  >
                    <Controller
                      name="connectionWA.groupsAddPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          onBlur={field.onBlur}
                          placeholder="Meus contatos"
                          options={optionsPrivacyGroupValue}
                          onChange={(e: any) => field.onChange(e.value)}
                          value={
                            field.value
                              ? {
                                  label:
                                    optionsPrivacyGroupValue.find(
                                      (s) => s.value === field.value,
                                    )?.label || "",
                                  value: field.value,
                                }
                              : null
                          }
                        />
                      )}
                    />
                  </Field>

                  <Field
                    errorText={
                      errors.connectionWA?.readReceiptsPrivacy?.message
                    }
                    invalid={!!errors.connectionWA?.readReceiptsPrivacy}
                    label="Confirmação de leitura"
                    disabled
                  >
                    <Controller
                      name="connectionWA.readReceiptsPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          isDisabled
                          onBlur={field.onBlur}
                          // options={optionsReadReceiptsValue}
                          placeholder="Ninguém"
                          onChange={(e: any) => field.onChange(e.value)}
                        />
                      )}
                    />
                  </Field>
                </HStack>
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
                          className={`inline-block w-full wrap-break-word rounded-md font-semibold whitespace-pre-wrap px-1.5 py-1 bg-yellow-200/20 text-white`}
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
                          className={`inline-block max-w-[80%] wrap-break-word rounded-md whitespace-pre-wrap px-1.5 py-1 bg-zinc-700/70 text-white`}
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
                        className={`inline-block max-w-[80%] wrap-break-word rounded-md whitespace-pre-wrap px-1.5 py-1 bg-teal-700 text-white`}
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
              <div className="flex items-center gap-x-2">
                <TextareaAutosize
                  placeholder="Enviar mensagem"
                  style={{ resize: "none" }}
                  minRows={1}
                  maxRows={6}
                  className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                  value={draft}
                  disabled={loadSend}
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
                <IconButton
                  onClick={() => {
                    if (draft.trim()) handleSubmit(sendMessage, onError)();
                  }}
                  loading={loadSend}
                  variant={"outline"}
                >
                  <RiSendPlane2Line />
                </IconButton>
              </div>
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
            disabled={isPending || isDirty}
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
          disabled={isPending || isSubmitting || !isDirty}
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
        <DialogTitle>Editar assistente de IA</DialogTitle>
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
