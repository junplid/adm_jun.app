import {
  Button,
  Center,
  IconButton,
  Input,
  SegmentGroup,
} from "@chakra-ui/react";
import { JSX, useCallback, useContext, useEffect, useState } from "react";
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
import { api } from "../../../services/api";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCampaign, useUpdateCampaign } from "../../../hooks/campaign";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import { Field } from "@components/ui/field";
// import SelectBusinesses from "@components/SelectBusinesses";
import TextareaAutosize from "react-textarea-autosize";
import SelectTags from "@components/SelectTags";
import SelectFlows from "@components/SelectFlows";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { IoIceCreamOutline } from "react-icons/io5";
import { BsFire } from "react-icons/bs";
import SelectConnectionsWA from "@components/SelectConnectionsWA";
import { MdHorizontalRule, MdOutlineDeleteOutline } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { CloseButton } from "@components/ui/close-button";

interface Props {
  id: number;
  close: () => void;
}

const optionsOpertaingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  flowId: z.string().min(1, { message: "Campo obrigatório." }),
  tagsIds: z
    .array(z.number(), {
      message: "Campo obrigatório.",
    })
    .min(1, { message: "Campo obrigatório." }),
  description: z.string().nullable(),
  // businessIds: z
  //   .array(z.number(), {
  //     message: "Campo obrigatório.",
  //   })
  //   .min(1, { message: "Campo obrigatório." }),
  shootingSpeedId: z.number(),
  connectionIds: z.array(z.number(), {
    message: "Campo obrigatório.",
  }),
  timeItWillStart: z.string().nullable(),
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

type Fields = z.infer<typeof FormSchema>;

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const { logout } = useContext(AuthContext);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
    setError,
    setValue,
    control,
    getValues,
    reset,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const operatingDays = watch("operatingDays");
  const { mutateAsync: updateBusiness, isPending } = useUpdateCampaign({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetCampaign(id);

  const [currentTab, setCurrentTab] = useState<
    "start-config" | "opening-hours"
  >("start-config");
  const [load, setLoad] = useState(true);
  const [shootingSpeeds, setShootingSpeeds] = useState<
    {
      id: number;
      name: string;
      sequence: number;
      status: boolean;
      shootingPerDay: number;
    }[]
  >([]);

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const edit = useCallback(async (): Promise<void> => {
    try {
      const values = getValues();
      const changedFields = Object.keys(dirtyFields).reduce((acc, key) => {
        // @ts-expect-error
        acc[key] = values[key];
        return acc;
      }, {} as Partial<Fields>);

      await updateBusiness({ id, body: changedFields });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [dirtyFields]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/private/shooting-speeds");
        setShootingSpeeds(data.shootingSpeeds);
        setValue("shootingSpeedId", data.shootingSpeeds[0].id);
        setLoad(false);
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                props?.setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    })();
  }, []);

  return (
    <form onSubmit={handleSubmit(edit)}>
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
                value="opening-hours"
                py={"27px"}
              >
                Horários de funcionamento
              </TabsTrigger>
            </TabsList>
          </Center>
          <TabsContent value="start-config">
            <div className="grid w-full gap-y-3">
              {/* <Field
                invalid={!!errors.businessIds}
                label="Anexe o projeto"
                className="w-full"
                required
                errorText={errors.businessIds?.message}
              >
                <Controller
                  name="businessIds"
                  control={control}
                  render={({ field }) => (
                    <SelectBusinesses
                      name={field.name}
                      isDisabled
                      isMulti
                      onBlur={field.onBlur}
                      onChange={(e: any) => {
                        field.onChange(e.map((item: any) => item.value));
                      }}
                      onCreate={(business) => {
                        setValue("businessIds", [
                          ...(getValues("businessIds") || []),
                          business.id,
                        ]);
                      }}
                      setError={({ name, message }) => {
                        if (name === "name") {
                          setError("businessIds", { message });
                        }
                      }}
                      value={field.value}
                    />
                  )}
                />
              </Field> */}

              <Field
                errorText={errors.name?.message}
                invalid={!!errors.name}
                label="Nome da campanha"
              >
                <Input
                  {...register("name", {
                    onChange(event) {
                      setValue("name", event.target.value);
                    },
                  })}
                  autoFocus
                  autoComplete="off"
                  placeholder="Digite o nome da campanha"
                />
              </Field>

              <Field
                errorText={errors.description?.message}
                invalid={!!errors.description}
                label="Descrição"
              >
                <TextareaAutosize
                  placeholder=""
                  style={{ resize: "none" }}
                  minRows={3}
                  maxRows={10}
                  className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                  {...register("description")}
                />
              </Field>

              <Field
                invalid={!!errors.tagsIds}
                label="Selecione os contatos por etiquetas"
                className="w-full"
                required
                errorText={errors.tagsIds?.message}
              >
                <Controller
                  name="tagsIds"
                  control={control}
                  render={({ field }) => (
                    <SelectTags
                      isDisabled
                      name={field.name}
                      isMulti
                      onBlur={field.onBlur}
                      onChange={(e: any) => {
                        field.onChange(e.map((item: any) => item.value));
                      }}
                      value={field.value}
                    />
                  )}
                />
              </Field>

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
                      isDisabled
                      name={field.name}
                      isMulti={false}
                      onBlur={field.onBlur}
                      onChange={(e: any) => field.onChange(e.value)}
                      value={field.value}
                    />
                  )}
                />
              </Field>

              <div className="flex items-center gap-y-1 flex-col">
                <span className="font-medium">Velocidade de disparo</span>
                {load ? (
                  <div className="flex items-center gap-x-3">
                    <span className="text-white/40">Carregando...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-x-3">
                      <div className="flex flex-col items-center">
                        <IoIceCreamOutline size={28} color="#197fd3" />
                        <small className="text-white/40">Safe</small>
                      </div>
                      <Controller
                        control={control}
                        name="shootingSpeedId"
                        render={({ field }) => (
                          <SegmentGroup.Root
                            name={field.name}
                            disabled={field.disabled}
                            onBlur={field.onBlur}
                            style={{
                              background:
                                "linear-gradient(90deg, #065ca1, #886905, #bb2c09)",
                            }}
                            className="h-16.5!"
                            value={String(field.value)}
                          >
                            <SegmentGroup.Indicator
                              shadow={"none"}
                              border={"1px solid #ffffff76"}
                              bg={"#ffffff29"}
                            />
                            <SegmentGroup.Items
                              className="cursor-pointer h-16.5!"
                              items={shootingSpeeds.map((s) => ({
                                label: (
                                  <div className="flex flex-col font-medium items-center">
                                    <span>{s.name}</span>
                                    <span
                                      style={{ fontSize: 11 }}
                                      className="block mt-1 leading-4"
                                    >
                                      {s.shootingPerDay}/dia
                                    </span>
                                    <span
                                      style={{ fontSize: 11 }}
                                      className="text-xs leading-3"
                                    >
                                      {(s.shootingPerDay / 24).toFixed(0)}/h
                                    </span>
                                  </div>
                                ),
                                value: String(s.id),
                                disabled: !s.status,
                              }))}
                            />
                          </SegmentGroup.Root>
                        )}
                      />
                      <div className="flex flex-col items-center">
                        <BsFire size={25} color="#e04721" />
                        <small className="text-white/40">Danger</small>
                      </div>
                    </div>
                    <span className="font-light text-white/70">
                      ~cálculo aproximado por conexão WA.
                    </span>
                  </>
                )}
              </div>

              <Field
                errorText={errors.connectionIds?.message}
                invalid={!!errors.connectionIds}
                label="Conexões WA"
                helperText={
                  "Em caso de indisponibilidade de uma conexão WA, outra assumirá automaticamente o lote de contatos pendentes."
                }
              >
                <Controller
                  name="connectionIds"
                  control={control}
                  render={({ field }) => (
                    <SelectConnectionsWA
                      name={field.name}
                      isMulti
                      isDisabled
                      onBlur={field.onBlur}
                      onChange={(e: any) => {
                        field.onChange(e.map((item: any) => item.value));
                      }}
                      value={field.value}
                    />
                  )}
                />
              </Field>
            </div>
          </TabsContent>
          <TabsContent value="opening-hours" className="min-h-65">
            <div className="-mt-1 flex flex-col gap-4">
              {!operatingDays?.length && (
                <span className="text-yellow-600 font-semibold text-center">
                  Disparará 24 horas por dia, 7 dias por semana.
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
                          disabled
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
                                `operatingDays.${dayIndex}.workingTimes.${timeIndex}.start`,
                              )}
                              disabled
                            />
                            <MdHorizontalRule size={33} />
                            <Input
                              size={"2xs"}
                              {...register(
                                `operatingDays.${dayIndex}.workingTimes.${timeIndex}.end`,
                              )}
                              type="time"
                              disabled
                            />
                            <IconButton
                              size={"xs"}
                              variant={"ghost"}
                              type="button"
                              color={"red.100"}
                              _hover={{ color: "red.400" }}
                              disabled
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
                          disabled
                          className="w-fit"
                        >
                          Adicionar horário
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </TabsRoot>
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

export function ModalEditCampaign({ close, id }: Props): JSX.Element {
  return (
    <DialogContent w={"470px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar campanha</DialogTitle>
        <DialogDescription>Edite as informações da campanha.</DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
