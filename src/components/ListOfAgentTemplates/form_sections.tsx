import { Field } from "@components/ui/field";
import { Section } from "./modal_agent";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Collapsible, IconButton, Input } from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import clsx from "clsx";
import SelectProviders from "@components/SelectProviders";
import { RiSendPlane2Line } from "react-icons/ri";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 } from "uuid";
import { testAgentTemplate } from "../../services/api/AgentTemplate";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { SocketContext } from "@contexts/socket.context";

interface Props {
  id: number;
  sections: Section[];
}

const InputItemSectionSchema = z.record(
  z.union([z.string(), z.number(), z.array(z.number()), z.array(z.string())]),
);

const schema = z.object({
  fields: z.record(InputItemSectionSchema),

  connectionWAId: z.number().nullish(),
  providerCredentialId: z.number().optional(),
  apiKey: z.string().optional(),
  nameProvider: z.string().optional(),
});
type Schema = z.infer<typeof schema>;

function buildDefaultValues(sections: Section[]) {
  const result = sections.reduce<
    Record<string, Record<string, string | number | string[] | number[]>>
  >((acc, section) => {
    const sectionDefaults = section.inputs.reduce<Record<string, string>>(
      (inputsAcc, input) => {
        if (input.defaultValue !== undefined) {
          inputsAcc[input.name] = input.defaultValue;
        }
        return inputsAcc;
      },
      {},
    );

    if (Object.keys(sectionDefaults).length > 0) {
      acc[section.name] = sectionDefaults;
    }

    return acc;
  }, {});
  return result;
}

type Message = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
};

export function FormSectionsComponent(props: Props) {
  const { socket } = useContext(SocketContext);
  const { logout } = useContext(AuthContext);
  const defaultValues = buildDefaultValues(props.sections);
  const [messages, setMessages] = useState<Message[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [errorDraft, setErrorDraft] = useState<string | null>(null);
  const token_modal_chat_templateRef = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [compose, setCompose] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setValue,
    setError,
    getValues,
    watch,
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: { fields: defaultValues },
  });

  const sendMessage = useCallback(async () => {
    try {
      if (!draft.trim() || !token_modal_chat_templateRef.current) return;
      setMessages((prev) => [
        ...prev,
        { id: v4(), role: "user", content: draft },
      ]);
      setDraft("");
      testAgentTemplate({
        content: draft.trim(),
        token_modal_chat_template: token_modal_chat_templateRef.current,
        fields: getValues("fields"),
        templatedId: props.id,
        apiKey: getValues("apiKey"),
        providerCredentialId: getValues("providerCredentialId"),
      });
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
  }, [draft, props.id]);

  const clearTokenTest = () => {
    if (token_modal_chat_templateRef.current) {
      socket.emit(
        "agent-template:clear-tokenTest",
        token_modal_chat_templateRef.current,
      );
      socket.off(`test-agent-template-${token_modal_chat_templateRef.current}`);
      createTokenTest();
    }
  };

  const createTokenTest = () => {
    token_modal_chat_templateRef.current = v4();
    socket.on(
      `test-agent-template-${token_modal_chat_templateRef.current}`,
      async (data: {
        role: "agent" | "system";
        content: string;
        compose?: boolean;
      }) => {
        if (data.compose === undefined) {
          if (
            data.role === "system" &&
            data.content === `System: Teste finalizado!`
          ) {
            clearTokenTest();
          }
          setMessages((prev) => [...prev, { id: v4(), ...data }]);
          return;
        }
        setCompose(data.compose);
      },
    );
  };

  useEffect(() => {
    createTokenTest();
  }, []);

  return (
    <form className="mt-10 flex flex-col space-y-3">
      {props.sections
        .filter((s) => !s.collapsible)
        .map((section) => (
          <div key={section.name} className="flex flex-col space-y-2">
            <div className="flex flex-col mb-4">
              <h3 className="font-semibold text-base">{section.title}</h3>
              <span className="text-neutral-400">{section.desc}</span>
            </div>

            {section.inputs.map((input) => (
              <div key={input.id}>
                {input.type === "text" && (
                  <Controller
                    control={control}
                    name={`fields.${section.name}.${input.name}`}
                    render={({ field: { value, ...rest } }) => {
                      return (
                        <Field
                          invalid={
                            !!errors?.fields?.[section.name]?.[input.name]
                          }
                          errorText={
                            errors?.fields?.[section.name]?.[input.name]
                              ?.message
                          }
                          label={input.label}
                          required={input.required}
                        >
                          <Input
                            placeholder={input.placeholder}
                            value={value ? String(value) : undefined}
                            {...rest}
                            className={value ? "bg-white/10!" : "bg-white/4!"}
                          />
                        </Field>
                      );
                    }}
                  />
                )}
                {input.type === "textarea" && (
                  <Controller
                    control={control}
                    name={`fields.${section.name}.${input.name}`}
                    render={({ field: { value, ...rest } }) => (
                      <Field
                        invalid={!!errors?.fields?.[section.name]?.[input.name]}
                        errorText={
                          errors?.fields?.[section.name]?.[input.name]?.message
                        }
                        label={input.label}
                        required={input.required}
                      >
                        <TextareaAutosize
                          placeholder={input.placeholder}
                          style={{ resize: "none" }}
                          minRows={3}
                          maxRows={6}
                          className={clsx(
                            "p-3 py-2.5 rounded-sm w-full border-white/10 border",
                            value ? "bg-white/10" : "bg-white/4",
                          )}
                          value={value ? String(value) : undefined}
                          {...rest}
                        />
                      </Field>
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

      {!!props.sections.filter((s) => s.collapsible).length && (
        <div className="mt-5">
          <Collapsible.Root>
            <Collapsible.Trigger
              className="w-full font-semibold bg-neutral-800 shadow-lg"
              paddingY="1.5"
            >
              Outras configurações
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="p-3 pb-5 space-y-3 flex flex-col bg-neutral-700/20 border border-neutral-800 border-t-0">
                {props.sections
                  .filter((s) => s.collapsible)
                  .map((section) => (
                    <div key={section.name} className="flex flex-col space-y-2">
                      <div className="flex flex-col mb-4">
                        <h3 className="font-semibold text-base">
                          {section.title}
                        </h3>
                        <span className="text-neutral-400">{section.desc}</span>
                      </div>

                      {section.inputs.map((input) => (
                        <div key={input.id}>
                          {input.type === "text" && (
                            <Controller
                              control={control}
                              name={`fields.${section.name}.${input.name}`}
                              render={({ field: { value, ...rest } }) => (
                                <Field
                                  invalid={
                                    !!errors?.fields?.[section.name]?.[
                                      input.name
                                    ]
                                  }
                                  errorText={
                                    errors?.fields?.[section.name]?.[input.name]
                                      ?.message
                                  }
                                  label={input.label}
                                  required={input.required}
                                >
                                  <Input
                                    placeholder={input.placeholder}
                                    value={String(value)}
                                    {...rest}
                                    className={
                                      value ? "bg-white/10!" : "bg-white/4!"
                                    }
                                  />
                                </Field>
                              )}
                            />
                          )}
                          {input.type === "textarea" && (
                            <Controller
                              control={control}
                              name={`fields.${section.name}.${input.name}`}
                              render={({ field: { value, ...rest } }) => (
                                <Field
                                  invalid={
                                    !!errors?.fields?.[section.name]?.[
                                      input.name
                                    ]
                                  }
                                  errorText={
                                    errors?.fields?.[section.name]?.[input.name]
                                      ?.message
                                  }
                                  label={input.label}
                                  required={input.required}
                                >
                                  <TextareaAutosize
                                    placeholder={input.placeholder}
                                    style={{ resize: "none" }}
                                    minRows={3}
                                    maxRows={6}
                                    className={clsx(
                                      "p-3 py-2.5 rounded-sm w-full border-white/10 border",
                                      value ? "bg-white/10" : "bg-white/4",
                                    )}
                                    value={String(value)}
                                    {...rest}
                                  />
                                </Field>
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      )}

      <div className="mt-5 flex flex-col space-y-2">
        <div className="flex flex-col mb-4">
          <h3 className="font-semibold text-base">Chave secreta da OpenAI</h3>
          <span className="text-neutral-400">
            Adicione sua credencial para o assistente de IA
          </span>
        </div>
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
                onChange={(e: any | null) => field.onChange(e?.value || null)}
                value={field.value}
              />
            )}
          />
        </Field>
        <span className="text-white/70 text-center block w-full font-semibold">
          Ou
        </span>
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
      </div>

      <div className="mt-5 flex flex-col items-center space-y-2">
        <div className="max-w-xs w-full flex gap-y-2 flex-col h-96 sticky top-3">
          {!!messages.length && (
            <div className="flex w-full items-center justify-between">
              <a
                onClick={() => {
                  clearTokenTest();
                  setMessages([]);
                }}
                className="text-sm text-white/50 hover:text-white cursor-pointer"
              >
                Limpar histórico
              </a>

              <a
                onClick={() => setShowLogs(!showLogs)}
                className={clsx(
                  showLogs
                    ? "hover:text-red-300 text-red-400"
                    : "hover:text-blue-300 text-blue-400",
                  "text-sm cursor-pointer",
                )}
              >
                {showLogs ? "Esconder" : "Mostrar"} logs
              </a>
            </div>
          )}
          <div className="flex flex-col flex-1 bg-zinc-400/5 rounded-md">
            <Virtuoso
              ref={virtuosoRef}
              data={
                showLogs
                  ? messages
                  : messages.filter((s) => s.role !== "system")
              }
              className="scroll-custom-table"
              followOutput="smooth"
              itemContent={(_, msg) => {
                if (msg.role === "system") {
                  return (
                    <div className="px-1 text-xs opacity-80">
                      <span
                        className={`inline-block wrap-break-word whitespace-pre-wrap px-1.5 py-1 bg-yellow-200/20 text-white`}
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
            {compose && (
              <span className="text-xs p-1 select-none text-white/45 animate-typing">
                digitando...
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <TextareaAutosize
                placeholder="Enviar mensagem"
                style={{ resize: "none" }}
                minRows={1}
                maxRows={3}
                className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <IconButton onClick={sendMessage} variant={"outline"}>
                <RiSendPlane2Line />
              </IconButton>
            </div>
            {errorDraft && (
              <span className="text-red-500 text-xs text-center">
                Error interno ao processar o teste
              </span>
            )}
            <span className="text-xs mt-1 text-center text-white/80">
              Teste e melhore até se adaptar às suas necessidades.
            </span>
            <span className="text-xs text-center text-white/50">
              A janela de teste dura 10 minutos e é renovada a cada mensagem
              enviada.
            </span>
          </div>
        </div>
      </div>
      {/* <Button
                        loading={loadSections}
                        onClick={() => {
                          getSections();
                        }}
                      >
                        Usar este template
                      </Button> */}
    </form>
  );
}
