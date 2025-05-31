import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Center,
  IconButton,
  Input,
  NumberInput,
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
import { ChatbotRow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import TextareaAutosize from "react-textarea-autosize";
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
  TabsContent,
} from "@components/ui/tabs";
import { MdHorizontalRule, MdOutlineDeleteOutline } from "react-icons/md";
import SelectComponent from "@components/Select";
import { GrClose } from "react-icons/gr";
import SelectFlows from "@components/SelectFlows";
import SelectConnectionsWA from "@components/SelectConnectionsWA";
import SelectTags from "@components/SelectTags";
import { useCreateChatbot } from "../../../hooks/chatbot";

type TypeChatbotInactivity = "seconds" | "minutes" | "hours" | "days";

interface IProps {
  onCreate?(business: ChatbotRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  businessId: z.number({ message: "Campo obrigatório." }),
  status: z.boolean().default(true).optional(),
  description: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  trigger: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  flowBId: z
    .string()
    .optional()
    .transform((v) => v || undefined),

  flowId: z.string({ message: "Campo obrigatório." }),
  connectionWAId: z.number().optional(),
  addLeadToAudiencesIds: z
    .array(z.number())
    .optional()
    .transform((v) => v || undefined),
  addToLeadTagsIds: z
    .array(z.number())
    .optional()
    .transform((v) => v || undefined),

  timeToRestart: z
    .object({
      value: z.number(),
      type: z.enum(["seconds", "minutes", "hours", "days"]),
    })
    .optional(),

  operatingDays: z
    .array(
      z.object({
        dayOfWeek: z.number(),
        workingTimes: z
          .array(z.object({ start: z.string(), end: z.string() }))
          .optional(),
      })
    )
    .optional(),
});

type Fields = z.infer<typeof FormSchema>;

const optionsStatus = [
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado-feira", value: 6 },
];

const typeDurationOffLeadOptions: {
  label: string;
  value: TypeChatbotInactivity;
}[] = [
  { label: "Segundos", value: "seconds" },
  { label: "Minutos", value: "minutes" },
  { label: "Horas", value: "hours" },
  { label: "Dias", value: "days" },
];

export function ModalCreateChatbot({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    setError,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: true,
      timeToRestart: { value: 3, type: "minutes" },
    },
  });

  const [currentTab, setCurrentTab] = useState<
    "start-config" | "activation-rules" | "opening-hours"
  >("start-config");
  const [open, setOpen] = useState(false);

  const { mutateAsync: createChatbot, isPending } = useCreateChatbot({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const chatbot = await createChatbot(fields);
      const { name, ...rest } = fields;
      reset();
      props.onCreate?.({ ...chatbot, name, ...rest });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const operatingDays = watch("operatingDays");

  const optionsOpertaingDaysMemo = useMemo(() => {
    if (!operatingDays?.length) return optionsOpertaingDays;
    const selectedDays = operatingDays.map((day) => day.dayOfWeek);
    return optionsOpertaingDays.filter((s) => !selectedDays.includes(s.value));
  }, [operatingDays?.length]);

  useEffect(() => {
    if (
      !!errors.name ||
      !!errors.businessId ||
      !!errors.status ||
      !!errors.description
    ) {
      setCurrentTab("start-config");
    } else if (
      !!errors.flowId ||
      !!errors.connectionWAId ||
      !!errors.addLeadToAudiencesIds ||
      !!errors.addToLeadTagsIds
    ) {
      setCurrentTab("activation-rules");
    } else if (errors.operatingDays) {
      setCurrentTab("opening-hours");
    }
  }, [
    errors.name,
    errors.businessId,
    errors.status,
    errors.description,
    errors.flowId,
    errors.connectionWAId,
    errors.addLeadToAudiencesIds,
    errors.addToLeadTagsIds,
    errors.operatingDays,
  ]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
      size={"sm"}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent backdrop as={"form"} onSubmit={handleSubmit(create)}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar bot de recepção</DialogTitle>
          <DialogDescription>
            80% das empresas usam WhatsApp para o marketing e vendas.
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
                  value="start-config"
                  py={"27px"}
                >
                  Configuração inicial
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="activation-rules"
                  py={"27px"}
                >
                  Regras de ativação
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="opening-hours"
                  py={"27px"}
                >
                  Horarios de funcionamento
                </TabsTrigger>
              </TabsList>
            </Center>
            <TabsContent value="start-config">
              <VStack gap={4}>
                <Field
                  invalid={!!errors.businessId}
                  label="Anexe o projeto"
                  className="w-full"
                  required
                  errorText={errors.businessId?.message}
                >
                  <Controller
                    name="businessId"
                    control={control}
                    render={({ field }) => (
                      <SelectBusinesses
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
                        onCreate={(business) => {
                          setValue("businessId", business.id);
                        }}
                        setError={({ name, message }) => {
                          if (name === "name") {
                            setError("businessId", { message });
                          }
                        }}
                        value={field.value}
                      />
                    )}
                  />
                </Field>
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome do bot"
                >
                  <Input
                    {...register("name", {
                      onChange(event) {
                        setValue("name", event.target.value);
                      },
                    })}
                    autoFocus
                    autoComplete="off"
                    placeholder="Digite o nome do bot de recepção"
                  />
                </Field>
                <Field
                  errorText={errors.status?.message}
                  invalid={!!errors.status}
                  label="Status do chatbot"
                >
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        isClearable={false}
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
                        options={optionsStatus}
                        value={
                          field.value
                            ? {
                                label:
                                  optionsStatus.find(
                                    (s) => s.value === field.value
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
                  label="Descrição"
                  errorText={errors.description?.message}
                  invalid={!!errors.description}
                  className="w-full"
                >
                  <TextareaAutosize
                    placeholder=""
                    style={{ resize: "none" }}
                    minRows={2}
                    maxRows={6}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    {...register("description")}
                  />
                </Field>
              </VStack>
            </TabsContent>
            <TabsContent value="activation-rules">
              <VStack gap={4}>
                <Field
                  errorText={errors.flowId?.message}
                  invalid={!!errors.flowId}
                  label="Fluxo de conversa"
                  required
                >
                  <Controller
                    name="flowId"
                    control={control}
                    render={({ field }) => (
                      <SelectFlows
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
                        value={field.value}
                      />
                    )}
                  />
                </Field>
                <Field
                  errorText={errors.connectionWAId?.message}
                  invalid={!!errors.connectionWAId}
                  label="Conexão WA"
                >
                  <Controller
                    name="connectionWAId"
                    control={control}
                    render={({ field }) => (
                      <SelectConnectionsWA
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => field.onChange(e.value)}
                        value={field.value}
                      />
                    )}
                  />
                </Field>
                {/* <Field
                    errorText={errors.connectionWAId?.message}
                    invalid={!!errors.connectionWAId}
                    label="Adicionar o lead aos públicos"
                    required
                  >
                    <Controller
                      name="connectionWAId"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false} 
                          onBlur={field.onBlur}
                          placeholder="Selecione a conexão WA"
                          onChange={(e: any) => field.onChange(e.value)}
                          options={optionsStatus}
                          // value={
                          //   field.value
                          //     ? {
                          //         label:
                          //           optionsStatus.find(
                          //             (s) => s.value === field.value
                          //           )?.label || "",
                          //         value: field.value,
                          //       }
                          //     : null
                          // }
                        />
                      )}
                    />
                  </Field> */}

                <Field
                  errorText={errors.addToLeadTagsIds?.message}
                  invalid={!!errors.addToLeadTagsIds}
                  label="Associar etiquetas ao contato"
                >
                  <Controller
                    name="addToLeadTagsIds"
                    control={control}
                    render={({ field }) => (
                      <SelectTags
                        name={field.name}
                        isMulti={true}
                        onBlur={field.onBlur}
                        onChange={(e: any) => {
                          field.onChange(e.map((item: any) => item.value));
                        }}
                        onCreate={(business) => {
                          setValue("addToLeadTagsIds", [
                            ...(getValues("addToLeadTagsIds") || []),
                            business.id,
                          ]);
                        }}
                        value={field.value}
                      />
                    )}
                  />
                </Field>
                <span className="block w-full h-[1px] my-2 bg-white/25"></span>
                <div className="grid gap-y-1">
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label={
                      <span>
                        Palavra-chave de ativação{" "}
                        <Badge colorPalette={"green"}>New</Badge>
                      </span>
                    }
                  >
                    <Input
                      {...register("trigger", {
                        onChange(event) {
                          setValue("trigger", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      maxLength={159}
                    />
                  </Field>
                  <span className="text-white/70">
                    Ativa o bot de recepção quando a mensagem recebida for igual
                    à palavra-chave configurada.
                  </span>
                </div>
                <div className="grid gap-y-1">
                  <Field
                    errorText={errors.flowBId?.message}
                    invalid={!!errors.flowBId}
                    label={
                      <span>
                        Fluxo alternativo B{" "}
                        <Badge colorPalette={"green"}>New</Badge>
                      </span>
                    }
                  >
                    <Controller
                      name="flowBId"
                      control={control}
                      render={({ field }) => (
                        <SelectFlows
                          name={field.name}
                          placeholder="Selecione o fluxo alternativo B"
                          isMulti={false}
                          onBlur={field.onBlur}
                          onChange={(e: any) => field.onChange(e.value)}
                          value={field.value}
                        />
                      )}
                    />
                  </Field>
                  <span className="text-white/70">
                    Mensagens diferentes da palavra-chave ativam o fluxo
                    alternativo B
                  </span>
                </div>
                <span className="block w-full h-[1px] my-2 bg-white/25"></span>
                <div className="grid gap-y-1">
                  <span className="font-semibold mb-0.5">
                    Intervalo para reativação automática do bot
                  </span>
                  <div className="grid grid-cols-[80px_1fr] gap-x-2">
                    <Field
                      errorText={errors.timeToRestart?.value?.message}
                      invalid={!!errors.timeToRestart?.value}
                    >
                      <NumberInput.Root
                        maxWidth={"28"}
                        min={0}
                        max={60}
                        size={"md"}
                      >
                        <NumberInput.Input
                          w={"100%"}
                          {...register(`timeToRestart.value`, {
                            valueAsNumber: true,
                          })}
                          placeholder="Número"
                        />
                      </NumberInput.Root>
                      {/* <Input
                        maxWidth={"28"}
                        
                        max={60}
                        autoComplete="off"
                        min={0}
                        type="number"
                        
                      /> */}
                    </Field>
                    <Field
                      // @ts-expect-error
                      errorText={errors.timeToRestart?.type?.message}
                      invalid={!!errors.timeToRestart?.type}
                    >
                      <Controller
                        name={`timeToRestart.type`}
                        control={control}
                        render={({ field }) => (
                          <SelectComponent
                            isClearable={false}
                            value={
                              field?.value
                                ? {
                                    label:
                                      typeDurationOffLeadOptions.find(
                                        (dd) => dd.value === field.value
                                      )?.label ?? "",
                                    value: field.value,
                                  }
                                : null
                            }
                            ref={field.ref}
                            name={field.name}
                            isMulti={false}
                            onChange={(p: any) => field.onChange(p.value)}
                            options={typeDurationOffLeadOptions}
                            placeholder="Unidade"
                          />
                        )}
                      />
                    </Field>
                  </div>
                  <span className="text-white/70">
                    Após o atendimento, o bot será reativado automaticamente
                    para o lead após o intervalo definido.
                  </span>
                </div>
              </VStack>
            </TabsContent>
            <TabsContent value="opening-hours" className="min-h-[260px]">
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
                        <div className="flex items-center">
                          <IconButton
                            size={"xs"}
                            variant={"ghost"}
                            type="button"
                            color={"red.100"}
                            _hover={{ color: "red.400" }}
                            onClick={() => {
                              setValue(
                                "operatingDays",
                                operatingDays.filter(
                                  (o) => o.dayOfWeek !== day.dayOfWeek
                                )
                              );
                            }}
                          >
                            <MdOutlineDeleteOutline />
                          </IconButton>
                          <div className="flex items-center gap-2 pl-1.5">
                            <span className="font-medium block">
                              {optionsOpertaingDays.find(
                                (op) => op.value === day.dayOfWeek
                              )?.label || ""}
                            </span>
                            {!day.workingTimes?.length && (
                              <span className="font-light text-yellow-600">
                                Funciona 24 horas
                              </span>
                            )}
                          </div>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {day.workingTimes?.map((_, timeIndex) => (
                            <li
                              key={timeIndex}
                              className="flex items-center gap-2"
                            >
                              <Input
                                type="time"
                                size={"2xs"}
                                {...register(
                                  `operatingDays.${dayIndex}.workingTimes.${timeIndex}.start`
                                )}
                              />
                              <MdHorizontalRule size={33} />
                              <Input
                                size={"2xs"}
                                {...register(
                                  `operatingDays.${dayIndex}.workingTimes.${timeIndex}.end`
                                )}
                                type="time"
                              />
                              <IconButton
                                size={"xs"}
                                variant={"ghost"}
                                type="button"
                                color={"red.100"}
                                _hover={{ color: "red.400" }}
                                onClick={() => {
                                  setValue(
                                    "operatingDays",
                                    operatingDays.map((o) => {
                                      if (o.dayOfWeek === day.dayOfWeek) {
                                        o.workingTimes = o.workingTimes?.filter(
                                          (__, i) => i !== timeIndex
                                        );
                                      }
                                      return o;
                                    })
                                  );
                                }}
                              >
                                <GrClose />
                              </IconButton>
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
                                "operatingDays",
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
                                })
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
                  name="operatingDays"
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
              </div>
            </TabsContent>
          </TabsRoot>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          {(currentTab === "start-config" ||
            currentTab === "activation-rules") && (
            <Button
              type="button"
              onClick={() => {
                if (currentTab === "start-config") {
                  setCurrentTab("activation-rules");
                } else {
                  setCurrentTab("opening-hours");
                }
              }}
              colorPalette={"cyan"}
              loading={isPending}
            >
              Avançar
            </Button>
          )}
          {currentTab === "opening-hours" && (
            <Button
              type="button"
              onClick={() => setCurrentTab("activation-rules")}
              colorPalette={"cyan"}
              loading={isPending}
            >
              Voltar
            </Button>
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
}
