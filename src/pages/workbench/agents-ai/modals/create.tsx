import {
  Badge,
  Button,
  Center,
  Checkbox,
  Float,
  HStack,
  IconButton,
  Input,
  NumberInput,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import React, {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgentsAIRow } from "..";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import { Field } from "@components/ui/field";
import { CloseButton } from "@components/ui/close-button";
import { api } from "../../../../services/api";
import SelectComponent from "@components/Select";
import { useCreateAgentAI, useDeleteAgentAI } from "../../../../hooks/agentAI";
import SelectProviders from "@components/SelectProviders";
import { v4 } from "uuid";
import { SocketContext } from "@contexts/socket.context";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RxLapTimer } from "react-icons/rx";
import { Tooltip } from "@components/ui/tooltip";
import { ErrorResponse_I } from "../../../../services/api/ErrorResponse";
import { AuthContext } from "@contexts/auth.context";
import { RiAlarmWarningLine, RiSendPlane2Line } from "react-icons/ri";
import {
  FaCheckCircle,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { Avatar } from "@components/ui/avatar";
import {
  MdHorizontalRule,
  MdLockOutline,
  MdOutlineDeleteOutline,
  MdOutlineModeEdit,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import { useHookFormMask } from "use-mask-input";
import { GrClose } from "react-icons/gr";
import { createFlow, deleteFlow } from "../../../../services/api/Flow";
import {
  createConnectionWA,
  deleteConnectionWA,
} from "../../../../services/api/ConnectionWA";
import { createChatbot, deleteChatbot } from "../../../../services/api/Chatbot";
import clsx from "clsx";
import {
  createConnectionIg,
  deleteConnectionIg,
} from "../../../../services/api/ConnectionIg";
import { AiFillAudio } from "react-icons/ai";
import {
  optionsEmojiLevel,
  optionsModels,
  optionsModelsTrans,
  optionsOpertaingDays,
  optionsPrivacyGroupValue,
  optionsPrivacyValue,
} from "./data";
import SelectConnectionsWA from "@components/SelectConnectionsWA";

interface Props {
  onCreate?(business: AgentsAIRow): Promise<void>;
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

export const FormSchema = z
  .object({
    providerCredentialId: z.number().optional(),
    apiKey: z.string().optional(),
    nameProvider: z.string().optional(),
    name: z
      .string({ message: "Campo obrigatório." })
      .trim()
      .min(1, { message: "Campo obrigatório." }),
    emojiLevel: z.enum(["none", "low", "medium", "high"]).optional(),
    language: z.string().optional(),
    personality: z
      .string()
      .transform((value) => value.trim() || undefined)
      .optional(),
    model: z
      .string({ message: "Campo obrigatório." })
      .min(1, { message: "Campo obrigatório." }),
    temperature: z.preprocess(
      toNumberOrUndef,
      z.number().min(0).max(2).optional(),
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
    connectionWA: FormSchemaConnectionWA.optional(),
    ig_id: z.string().optional(),
    chatbot: FormSchemaChatbot.optional(),
    modelTranscription: z.string().nullish(),
    connectionWAId: z.number().nullish(),
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

type Message = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
};

interface AccountIg {
  used_by: {
    id: number;
    name: string;
  }[];
  page_id: string;
  page_name: string;
  ig_id: string;
  ig_username: string;
  ig_picture: string;
}

function Content(props: { onClose: () => void }) {
  const {
    logout,
    account: { businessId },
    clientMeta,
  } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [errorDraft, setErrorDraft] = useState<string | null>(null);
  const [loadSend, setLoadSend] = useState(false);
  const [accounts, setAccounts] = useState<AccountIg[]>([]);
  const [currentTab, setCurrentTab] = useState<
    "secret-key" | "persona" | "engine" | "connection"
  >("secret-key");
  const [tokenTest, setTokenTest] = useState<string>("");
  const {
    handleSubmit,
    register,
    formState: { errors },
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

  const { mutateAsync: createAgentAI, isPending } = useCreateAgentAI({
    setError,
    async onSuccess() {
      setCurrentTab("secret-key");
    },
  });

  const { mutateAsync: deleteAgentAI } = useDeleteAgentAI();

  const modal_id = useMemo(() => {
    const state = v4();
    return state;
  }, []);

  const create = useCallback(
    async ({
      files,
      connectionWA,
      instructions,
      chatbot,
      ig_id,
      connectionWAId,
      ...fields
    }: Fields): Promise<void> => {
      let state: any = {};
      try {
        const agentAI = await createAgentAI({
          ...fields,
          instructions,
          files: files?.map((s) => s.id),
        });
        state.agentId = agentAI.id;
        const flow = await createFlow({
          name: `Flow for ${fields.name}`,
          type: "chatbot",
          businessIds: [businessId],
          agentId: agentAI.id,
        });
        state.flowId = flow.id;
        if (!connectionWAId) {
          const connection = await createConnectionWA({
            businessId,
            ...connectionWA,
            name: `Connection for ${fields.name}`,
            type: "chatbot",
            agentId: agentAI.id,
          });
          state.connectionWAId = connection.id;
        }
        if (ig_id) {
          const { id } = await createConnectionIg({
            ig_id,
            modal_id,
            agentId: agentAI.id,
            businessId,
          });
          state.connectionIgId = id;
        }
        const cb = await createChatbot({
          businessId,
          flowId: flow.id,
          name: `Bot for ${fields.name}`,
          connectionWAId: connectionWAId || state.connectionWAId,
          connectionIgId: state.connectionIgId || undefined,
          ...chatbot,
          status: true,
          agentId: agentAI.id,
        });
        state.chatbotId = cb.id;
        props.onClose();
        reset();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (state.agentId) await deleteAgentAI(state.agentId);
          if (state.flowId) await deleteFlow(state.flowId);
          if (state.connectionWAId)
            await deleteConnectionWA(state.connectionWAId);
          if (state.connectionIgId)
            await deleteConnectionIg(state.connectionIgId);
          if (state.chatbotId) await deleteChatbot(state.chatbotId);
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [modal_id, accounts, businessId],
  );

  const providerCredentialId = watch("providerCredentialId");
  const apiKey = watch("apiKey");
  const operatingDays = watch("chatbot.operatingDays");
  const fileImage = watch("connectionWA.fileImage");
  const service_tier = watch("service_tier");
  const model = watch("model");
  const ig_id = watch("ig_id");

  const optionsOpertaingDaysMemo = useMemo(() => {
    if (!operatingDays?.length) return optionsOpertaingDays;
    const selectedDays = operatingDays.map((day) => day.dayOfWeek);
    return optionsOpertaingDays.filter((s) => !selectedDays.includes(s.value));
  }, [operatingDays?.length]);

  useEffect(() => {
    setTokenTest(v4());
    socket.emit("join_modal:create_agentai", modal_id);
    socket.on("receber_accounts", (accounts: AccountIg[]) => {
      if (accounts.length === 1) setValue("ig_id", accounts[0].ig_id);
      setAccounts(accounts);
    });

    return () => {
      setTokenTest("");
      socket.emit("exit_modal:create_agentai", modal_id);
      socket.off("receber_accounts");
    };
  }, [modal_id]);

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

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
  }, [fileImage]);

  const clearTokenTest = () => {
    if (tokenTest) {
      socket.emit("agent-ai:clear-tokenTest", tokenTest);
    }
  };

  const sendMessage = useCallback(
    async (fields: Fields) => {
      try {
        if (!draft.trim()) return;
        setLoadSend(true);
        setMessages((prev) => [
          ...prev,
          { id: v4(), role: "user", content: draft },
        ]);
        setDraft("");
        const { timeout, files, debounce, nameProvider, ...restf } = fields;
        await api.post("/private/agents-ai/test", {
          ...restf,
          businessIds: [businessId],
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

  const onError = (errs: typeof errors) => {
    if (errs.apiKey || errs.providerCredentialId || errs.nameProvider) {
      setCurrentTab("secret-key");
      return;
    }
    if (
      // errs.businessIds ||
      errs.name ||
      errs.emojiLevel ||
      errs.language ||
      errs.personality
    ) {
      setCurrentTab("persona");
      return;
    }
    // erros de engine, se houver
    setCurrentTab("engine");
  };

  return (
    <form onSubmit={handleSubmit(create, onError)}>
      <DialogBody
        mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
        px={clientMeta.isMobileLike ? 2 : undefined}
      >
        <div
          className={clsx(
            !clientMeta.isMobileLike && "grid grid-cols-[422px_1fr] gap-x-3",
            "relative",
          )}
        >
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
                  px={clientMeta.isMobileLike ? "2px" : undefined}
                >
                  Integração secret key
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="persona"
                  py={"27px"}
                  px={clientMeta.isMobileLike ? "7px" : undefined}
                >
                  {clientMeta.isMobileLike
                    ? "Perfil e treinam..."
                    : "Perfil e treinamento"}
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="engine"
                  py={"27px"}
                  px={clientMeta.isMobileLike ? "2px" : undefined}
                >
                  Horários operação
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="connection"
                  py={"27px"}
                  px={clientMeta.isMobileLike ? "12px" : undefined}
                >
                  <FaWhatsapp size={clientMeta.isMobileLike ? 30 : 40} />
                  <FaInstagram size={clientMeta.isMobileLike ? 30 : 40} />
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
                        isSearchable={false}
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
                  helperText="Não é o nome do assistente e não será exibido para os usuários."
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
            </TabsContent>
            <TabsContent value="persona" mt={-3}>
              <VStack gap={4}>
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome do assistente de IA"
                  required
                >
                  <Input
                    {...register("name", {
                      onChange(event) {
                        setValue("name", event.target.value);
                      },
                    })}
                    autoComplete="off"
                    placeholder="Digite o nome do assistente"
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
                          isSearchable={false}
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
                    helperText="Idioma que o assistente usará. padrão é PT-BR."
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
                          isSearchable={false}
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
                  label="Personalidade"
                  errorText={errors.personality?.message}
                  invalid={!!errors.personality}
                  className="w-full"
                >
                  <TextareaAutosize
                    placeholder="Você é um assistente útil e amigável, sempre pronto para ajudar os usuários com suas perguntas e preocupações."
                    style={{ resize: "none" }}
                    minRows={3}
                    maxRows={6}
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
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
                            isSearchable={false}
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
                      <Field
                        helperText={
                          clientMeta.isMobileLike
                            ? "Barato e maior latência"
                            : "Barato e com maior latência"
                        }
                      >
                        <Checkbox.Root
                          checked={service_tier === "flex"}
                          onCheckedChange={(e) =>
                            setValue(
                              "service_tier",
                              e.checked ? "flex" : "default",
                            )
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>
                            Modo Julius
                            {!clientMeta.isMobileLike && (
                              <span className="text-white/60 font-light text-sm">
                                (pai do Chris)
                              </span>
                            )}
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </Field>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Field
                      invalid={!!errors.temperature}
                      label="Temperatura"
                      helperText={
                        clientMeta.isMobileLike
                          ? "Controla a aleatoriedade das respostas."
                          : "Controla a aleatoriedade das respostas do assistente."
                      }
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
                    {optionsModels.some(
                      (m) => m.value === model && m.isPriority,
                    ) && (
                      <Field
                        helperText={
                          clientMeta.isMobileLike
                            ? "Caro e menor latência"
                            : "Mais caro e menor latência"
                        }
                      >
                        <Checkbox.Root
                          checked={service_tier === "priority"}
                          onCheckedChange={(e) =>
                            setValue(
                              "service_tier",
                              e.checked ? "priority" : "default",
                            )
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>
                            Modo prioridade
                            {!clientMeta.isMobileLike && (
                              <span className="text-white/60 font-light text-sm">
                                (+ rápido)
                              </span>
                            )}
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </Field>
                    )}
                  </div>
                </div>

                {model && (
                  <p className="bg-green-100/10 p-1 -mt-1.5 w-full">
                    {optionsModels.find((o) => o.value === model)?.desc}
                  </p>
                )}
                <Field
                  errorText={errors.modelTranscription?.message}
                  invalid={!!errors.modelTranscription}
                  helperText="Selecione o modelo que transcreve fala para texto."
                  className="relative mt-1"
                >
                  <Controller
                    name="modelTranscription"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        placeholder="Selecione"
                        isMulti={false}
                        isSearchable={false}
                        onBlur={field.onBlur}
                        options={optionsModelsTrans.map((s) => ({
                          label: s.label,
                          value: s.value,
                        }))}
                        isClearable={!!field.value}
                        onChange={(e: any) => {
                          field.onChange(e?.value || null);
                        }}
                        value={
                          field.value
                            ? {
                                label: optionsModelsTrans.find(
                                  (item) => item.value === field.value,
                                )?.label,
                                value: field.value,
                              }
                            : {
                                label: (
                                  <span className="flex gap-x-1 items-center">
                                    Não habilitado a compreender áudios{" "}
                                    <AiFillAudio className="text-green-400" />
                                  </span>
                                ),
                                value: field.value,
                              }
                        }
                      />
                    )}
                  />
                  <Float offsetX={6} offsetY={-1}>
                    <Badge colorPalette={"green"}>NEW</Badge>
                  </Float>
                </Field>
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <Field
                    errorText={errors.timeout?.message}
                    invalid={!!errors.timeout}
                    label={
                      <div className="flex flex-col -space-y-1">
                        <span>
                          {clientMeta.isMobileLike
                            ? "Segundos esperando"
                            : "Segundos esperando resposta"}
                        </span>

                        {clientMeta.isMobileLike ? (
                          <span className="text-white/60 font-light">
                            resposta
                          </span>
                        ) : (
                          <span className="text-white/60 font-light">
                            *Funciona apenas em chat real
                          </span>
                        )}
                      </div>
                    }
                    helperText={
                      clientMeta.isMobileLike ? (
                        <span className="">
                          Ao se esgotar sai pelo canal Node:{" "}
                          <RxLapTimer
                            size={16}
                            className="text-red-400 -translate-y-0.5 inline"
                          />
                          .
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="">
                            Caso o tempo limite se esgote
                          </span>
                          <span className="flex items-center gap-x-1">
                            sairá pelo canal Node:{" "}
                            <RxLapTimer
                              size={16}
                              className="text-red-400 -translate-y-0.5"
                            />
                            .
                          </span>
                        </div>
                      )
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
                        <span>Limitar frequência</span>
                        {clientMeta.isMobileLike ? (
                          <span className="text-white/60 font-light">
                            de golpes
                          </span>
                        ) : (
                          <span className="text-white/60 font-light">
                            *Funciona apenas em chat real
                          </span>
                        )}
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
                      className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
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
                      <div className="flex flex-col items-center w-full">
                        <Button disabled size={"sm"} w={"full"}>
                          Selecionar os documentos
                        </Button>
                        <span className="text-red-300 text-sm">
                          Treinamento por documentos está temporariamente
                          desabilitado para um melhor estudo de casos.
                        </span>
                      </div>
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
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                    {...register("instructions")}
                  />
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
                      isSearchable={false}
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
                  label={
                    <span>
                      Fallback <Badge colorPalette={"green"}>New</Badge>
                    </span>
                  }
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
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                    {...register("chatbot.fallback")}
                  />
                </Field>
              </div>
            </TabsContent>
            <TabsContent value="connection">
              <TabsRoot
                lazyMount
                unmountOnExit
                variant={"enclosed"}
                defaultValue={"whatsapp"}
                mt={-4}
              >
                <Center mb={2}>
                  <TabsList bg="#1c1c1c" rounded="l3" p="1.5">
                    <TabsTrigger
                      _selected={{ bg: "bg.subtle", color: "#fff" }}
                      color={"#757575"}
                      value="whatsapp"
                    >
                      WhatsApp
                    </TabsTrigger>
                    <TabsTrigger
                      _selected={{ bg: "bg.subtle", color: "#fff" }}
                      color={"#757575"}
                      value="instagram"
                    >
                      Instagram
                    </TabsTrigger>
                  </TabsList>
                </Center>
                <TabsContent
                  value="instagram"
                  className={clsx(
                    clientMeta.isMobileLike ? "p-4" : "p-6",
                    "rounded-lg border border-slate-100/10",
                  )}
                >
                  {accounts.length ? (
                    <div className="max-w-2xl mx-auto">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaInstagram className="text-pink-600" /> Selecione o
                        Instagram
                      </h2>
                      <p className="text-gray-300 text-sm mb-4">
                        Encontramos{" "}
                        {accounts.length > 1
                          ? "estas contas vinculadas ao seu Facebook."
                          : "esta conta vinculada ao seu Facebook."}
                      </p>

                      <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-2">
                        {accounts.map((page) => (
                          <div
                            key={page.ig_id}
                            onClick={() => {
                              if (ig_id === page.ig_id) {
                                setValue("ig_id", undefined);
                                return;
                              }
                              setValue("ig_id", page.ig_id);
                            }}
                            className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
                              ig_id === page.ig_id
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-100/40 bg-white/10 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={page.ig_picture}
                                  alt={page.ig_username}
                                  className={clsx(
                                    ig_id === page.ig_id
                                      ? "border-gray-200"
                                      : "border-gray-600",
                                    "w-12 h-12 rounded-full border",
                                  )}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-2 border-white">
                                  <FaFacebook className="text-white text-[8px]" />
                                </div>
                              </div>
                              <div>
                                <p
                                  className={clsx(
                                    ig_id === page.ig_id
                                      ? "text-gray-800"
                                      : "text-white",
                                    "font-semibold ",
                                  )}
                                >
                                  @{page.ig_username}
                                </p>
                                <p
                                  className={clsx(
                                    ig_id === page.ig_id
                                      ? "text-gray-600"
                                      : "text-gray-400",
                                    "text-xs",
                                  )}
                                >
                                  Página: {page.page_name}
                                </p>
                              </div>
                            </div>

                            {ig_id === page.ig_id ? (
                              <FaCheckCircle className="text-pink-500 text-xl" />
                            ) : (
                              <MdOutlineRadioButtonUnchecked className="text-gray-300 text-xl" />
                            )}
                          </div>
                        ))}
                      </div>
                      <hr className="border-slate-100/10" />
                      <div className="mt-4 px-2">
                        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400 italic">
                          * Caso você não finalize a criação do assistente,
                          todos os dados importados nesta sessão serão
                          **deletados permanentemente** de nossos servidores
                          imediatamente.
                        </p>

                        <p className="mt-4 text-center text-xs text-slate-400">
                          <span className="block font-semibold mb-1 text-slate-300">
                            Privacidade por Design:
                          </span>
                          Após a criação, armazenamos apenas as credenciais
                          estritamente necessárias para o gerenciamento das DMs,
                          protegidas por criptografia de nível bancário. Por
                          segurança, não mantemos acesso persistente ao seu
                          perfil do Facebook; assim, para gerenciar novas contas
                          no futuro, uma nova conexão será solicitada.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-3">
                      <div
                        className={clsx(
                          clientMeta.isMobileLike ? "gap-2" : "gap-4",
                          "flex items-center",
                        )}
                      >
                        <div className="p-3 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl shadow-lg">
                          <FaInstagram
                            size={clientMeta.isMobileLike ? 25 : 40}
                          />
                        </div>
                        <div>
                          <h2
                            className={clsx(
                              clientMeta.isMobileLike ? "text-xl" : "text-2xl",
                              "font-bold text-white",
                            )}
                          >
                            Conectar DM
                          </h2>
                          <p className="text-gray-300 text-sm">
                            Conecte sua conta para responder clientes
                            automaticamente via Assistente de IA.
                          </p>
                        </div>
                      </div>

                      <hr className="border-slate-100/10" />

                      <div
                        className={
                          clientMeta.isMobileLike ? "space-y-2" : "space-y-4"
                        }
                      >
                        <h3 className="text-lg font-semibold text-white">
                          Como funciona?
                        </h3>
                        <ul
                          className={
                            clientMeta.isMobileLike ? "space-y-2" : "space-y-3"
                          }
                        >
                          <li className="flex items-start gap-3 text-gray-200 italic">
                            <span className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
                              1
                            </span>
                            <span>
                              Sua conta do Instagram deve ser{" "}
                              <strong>Comercial (Business)</strong> e estar
                              vinculada a uma Página do Facebook.
                            </span>
                          </li>
                          <li className="flex items-start gap-3 text-gray-200">
                            <span className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
                              2
                            </span>
                            <span>
                              Ao clicar no botão abaixo, você autoriza nossa
                              plataforma a gerenciar suas mensagens.
                            </span>
                          </li>
                          <li className="flex items-start gap-3 text-gray-200">
                            <span className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
                              3
                            </span>
                            <span>
                              Seu assistente de IA passará a responder suas DMs
                              instantaneamente 24 horas por dia.
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 pr-2 rounded-r-md">
                        <div className="flex items-center gap-3">
                          <RiAlarmWarningLine
                            className="text-amber-600"
                            size={40}
                          />
                          <p className="text-sm text-amber-700 font-medium">
                            Certifique-se de ativar "Permitir acesso às
                            mensagens" nas configurações do seu Instagram.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => {}}
                          title="Atualmente indisponível."
                          className={clsx(
                            clientMeta.isMobileLike
                              ? "gap-1 px-3"
                              : "gap-3 px-6",
                            "relative w-full flex items-center justify-center gap-3 py-4 bg-blue-600/30 text-white/30 font-bold rounded-xl",
                          )}
                          type="button"
                        >
                          <div className="absolute right-2 text-xs items-center -top-2 bg-white flex text-black font-normal gap-x-1 rounded-md p-1">
                            <span>Indisponível</span>
                            <MdLockOutline size={17} />
                          </div>
                          <FaFacebook size={20} />
                          Conectar com Facebook / Instagram
                        </button>
                        <p className="mt-2 text-center text-xs text-slate-400">
                          Ao conectar sua conta, você concorda com nossos{" "}
                          <a
                            href="/terms-of-use"
                            className="text-white underline"
                          >
                            Termos de Uso
                          </a>{" "}
                          e{" "}
                          <a
                            href="/privacy-policy"
                            className="text-white underline"
                          >
                            Política de Privacidade
                          </a>
                          .
                        </p>
                        <p className="mt-4 text-center text-xs text-slate-400">
                          Sua segurança é nossa prioridade. Nunca armazenamos
                          sua senha pessoal. Todas as credenciais de acesso são
                          protegidas por criptografia de ponta a ponta,
                          garantindo a total integridade e privacidade dos seus
                          dados.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="whatsapp">
                  <VStack gap={4}>
                    <Field
                      errorText={errors.connectionWAId?.message}
                      invalid={!!errors.connectionWAId}
                      label="Selecionar conexão existente"
                    >
                      <Controller
                        name="connectionWAId"
                        control={control}
                        render={({ field }) => (
                          <SelectConnectionsWA
                            name={field.name}
                            isSearchable={false}
                            isClearable={true}
                            isMulti={false}
                            onBlur={field.onBlur}
                            onChange={(e: any) =>
                              field.onChange(e?.value || null)
                            }
                            value={field.value}
                          />
                        )}
                      />
                    </Field>
                    <span className="font-semibold">OU</span>
                    <div className="px-5">
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 pr-2 rounded-r-md">
                        <div className="flex items-center gap-3">
                          <RiAlarmWarningLine
                            className="text-amber-600"
                            size={40}
                          />
                          <p className="text-sm text-amber-700 font-medium">
                            Caso seu WhatsApp já esteja configurado,
                            desconsidere os campos abaixo.
                          </p>
                        </div>
                      </div>
                    </div>
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
                                setValue("connectionWA.fileImage", file);
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
                          errorText={
                            errors.connectionWA?.profileStatus?.message
                          }
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
                        errorText={
                          errors.connectionWA?.lastSeenPrivacy?.message
                        }
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
                              isSearchable={false}
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
                              isSearchable={false}
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
                        errorText={
                          errors.connectionWA?.imgPerfilPrivacy?.message
                        }
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
                              isSearchable={false}
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
                              isSearchable={false}
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
                        errorText={
                          errors.connectionWA?.groupsAddPrivacy?.message
                        }
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
                              isSearchable={false}
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
                              isSearchable={false}
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
                    <div className="flex items-center gap-x-2">
                      <div className="border p-1 max-w-20 bg-white/2 text-green-100/5">
                        <img src="/image-btn-connection.png" />
                      </div>
                      <p className="font-medium">
                        Será possível conectar o WhatsApp {"(Via desktop)"} após
                        criação do assistente de IA.
                      </p>
                    </div>
                  </VStack>
                </TabsContent>
              </TabsRoot>
            </TabsContent>
          </TabsRoot>
          {!clientMeta.isMobileLike && (
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
                    disabled={loadSend}
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
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
                  Teste seu assistente.
                </span>
                {errorDraft && (
                  <span className="text-red-500 text-xs text-center">
                    Error interno ao processar o teste
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* {!ig_id && (
          <div className="mt-4 flex flex-col">
            <div className="bg-amber-50 border-l-4 mb-2 border-amber-400 p-3 pr-2 rounded-r-md">
              <div className="flex items-center gap-x-1">
                <RiAlarmWarningLine className="text-amber-600" size={20} />
                <h4 className="font-semibold text-amber-600">
                  Aviso importante sobre a integração com Instagram
                </h4>
              </div>
              <p className="text-xs mt-1 text-amber-700">
                Antes de criar um assistente de IA com integração ao Instagram,
                é obrigatório estar ciente de que o Instagram impõe uma janela
                de atendimento de 24 horas para envio de mensagens em DM.
              </p>
              <p className="text-xs mt-1 text-amber-700">
                Caso o assistente tente enviar uma mensagem fora dessa janela de
                24 horas, o atendimento será encerrado automaticamente, conforme
                as regras da plataforma do Instagram. Não será possível
                continuar a conversa após essa tentativa.
              </p>
              <p className="text-xs mt-1 text-amber-700">
                Estamos trabalhando para implementar, em breve, um sistema de
                follow-ups via DM, respeitando as políticas da plataforma.
              </p>
              <p className="text-xs mt-1 text-amber-700">
                Enquanto isso, recomendamos que: Você crie assistentes separados
                para outros canais, como WhatsApp{"(QR Code)"}, caso precise
                realizar follow-ups
              </p>
            </div>
            <Checkbox.Root
              checked={service_tier === "flex"}
              // onCheckedChange={(e) =>
              //   setRequireDM(e.checked)
              // }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label className="text-xs!">
                Declaro que estou ciente de que, na integração com o Instagram,
                o envio de mensagens é limitado à janela de 24 horas. Caso o
                assistente tente enviar mensagens fora desse período, o
                atendimento será encerrado automaticamente. Para qualquer tipo
                de follow-up, devo utilizar outro canal, como o WhatsApp
                {"(QR Code)"}.
              </Checkbox.Label>
            </Checkbox.Root>
          </div>
        )} */}
      </DialogBody>

      <DialogFooter px={clientMeta.isMobileLike ? 2 : undefined}>
        <DialogActionTrigger asChild>
          <Button
            type="button"
            size={clientMeta.isMobileLike ? "sm" : undefined}
            disabled={isPending}
            variant="outline"
          >
            Cancelar
          </Button>
        </DialogActionTrigger>
        {currentTab === "secret-key" && (
          <Button
            type="button"
            size={clientMeta.isMobileLike ? "sm" : undefined}
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
              size={clientMeta.isMobileLike ? "sm" : undefined}
              onClick={() => setCurrentTab("secret-key")}
              colorPalette={"cyan"}
              disabled={isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              size={clientMeta.isMobileLike ? "sm" : undefined}
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
              size={clientMeta.isMobileLike ? "sm" : undefined}
              onClick={() => setCurrentTab("persona")}
              colorPalette={"cyan"}
              disabled={isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              size={clientMeta.isMobileLike ? "sm" : undefined}
              onClick={() => setCurrentTab("connection")}
              colorPalette={"cyan"}
              disabled={isPending}
            >
              Avançar
            </Button>
          </>
        )}
        {currentTab === "connection" && (
          <Button
            type="button"
            size={clientMeta.isMobileLike ? "sm" : undefined}
            onClick={() => setCurrentTab("engine")}
            colorPalette={"cyan"}
            disabled={isPending}
          >
            Voltar
          </Button>
        )}
        <Button
          size={clientMeta.isMobileLike ? "sm" : undefined}
          type="submit"
          loading={isPending}
        >
          Criar
        </Button>
      </DialogFooter>
    </form>
  );
}

export const ModalCreateAgentAI: React.FC<Props> = (props): JSX.Element => {
  const { clientMeta } = useContext(AuthContext);

  return (
    <DialogContent
      w={clientMeta.isMobileLike ? undefined : "760px"}
      mx={2}
      backdrop
    >
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Criar assistente de IA</DialogTitle>
        <DialogDescription>
          Autônomos que usam IA para realizar tarefas.
        </DialogDescription>
      </DialogHeader>
      <Content onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
