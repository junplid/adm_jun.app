import { JSX, useCallback, useMemo, useRef, useState } from "react";
import { Button, Center, HStack, Input, Text, VStack } from "@chakra-ui/react";
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
import { ConnectionWARow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import SelectBusinesses from "@components/SelectBusinesses";
import { useCreateConnectionWA } from "../../../hooks/connectionWA";
import TextareaAutosize from "react-textarea-autosize";
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
  TabsContent,
} from "@components/ui/tabs";
import { Avatar } from "@components/ui/avatar";
import { Tooltip } from "@components/ui/tooltip";
import { MdOutlineModeEdit } from "react-icons/md";
import SelectComponent from "@components/Select";

interface IProps {
  onCreate?(business: ConnectionWARow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  description: z.string().optional(),
  // businessId: z.number({ message: "Campo obrigatório." }),
  type: z.enum(["chatbot", "marketing"], {
    message: "Campo obrigatório.",
  }),
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

type Fields = z.infer<typeof FormSchema>;

const optionsPrivacyValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  { label: "Ninguém", value: "none" },
];

const optionsOnlinePrivacy = [
  { label: "Todos", value: "all" },
  { label: 'Mesmo que "visto por último"', value: "match_last_seen" },
];

const optionsPrivacyGroupValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  // { label: "Ninguém", value: "none" },
];

const optionsReadReceiptsValue = [
  { label: "Todos", value: "all" },
  { label: "Ninguém", value: "none" },
];

export function ModalCreateConnectionWA({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: { type: "chatbot" },
  });
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const { mutateAsync: createConnectionWA, isPending } = useCreateConnectionWA({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createConnectionWA(fields);
      // const { name, ...rest } = fields;
      reset();
      // props.onCreate?.({ ...connectionWA, name, ...rest });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const fileImage = watch("fileImage");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
  }, [fileImage]);

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
          <DialogTitle>Criar conexão</DialogTitle>
          <DialogDescription>
            80% das empresas usam o WhatsApp para vendas.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt={"-5px"}>
          <TabsRoot
            lazyMount
            unmountOnExit
            variant={"enclosed"}
            defaultValue={"integration"}
          >
            <Center mb={2}>
              <TabsList bg="#1c1c1c" rounded="l3" p="1.5">
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="integration"
                >
                  Integração
                </TabsTrigger>
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="config"
                >
                  Configurações do perfil
                </TabsTrigger>
              </TabsList>
            </Center>
            <TabsContent value="integration">
              <VStack gap={4}>
                {/* <Field
                  errorText={errors.businessId?.message}
                  invalid={!!errors.businessId}
                  label="Anexe o projeto"
                  required
                  className="w-full"
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
                </Field> */}
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome"
                  helperText="Não é o nome que será exibido no perfil do WhatsApp."
                >
                  <Input
                    {...register("name", {
                      onChange(event) {
                        setValue("name", event.target.value);
                      },
                    })}
                    autoFocus
                    autoComplete="off"
                    placeholder="Digite o nome da conexão"
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
                    className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                    {...register("description")}
                  />
                </Field>
              </VStack>
            </TabsContent>
            <TabsContent value="config">
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
                          if (file) setValue("fileImage", file);
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
                      errorText={errors.profileName?.message}
                      invalid={!!errors.profileName}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("profileName")}
                        autoComplete="off"
                        placeholder="Nome do perfil"
                      />
                    </Field>
                    <Field
                      errorText={errors.profileStatus?.message}
                      invalid={!!errors.profileStatus}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("profileStatus")}
                        autoComplete="off"
                        placeholder="Recado"
                      />
                    </Field>
                  </VStack>
                </HStack>
                <Text fontWeight={"medium"}>Privacidade</Text>
                <HStack w={"full"}>
                  <Field
                    errorText={errors.lastSeenPrivacy?.message}
                    invalid={!!errors.lastSeenPrivacy}
                    label="Visto por último"
                    disabled
                  >
                    <Controller
                      name="lastSeenPrivacy"
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
                    errorText={errors.onlinePrivacy?.message}
                    invalid={!!errors.onlinePrivacy}
                    label="Online"
                    disabled
                  >
                    <Controller
                      name="onlinePrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          onBlur={field.onBlur}
                          isDisabled
                          placeholder={'Igual ao "visto por último"'}
                          options={optionsOnlinePrivacy}
                          onChange={(e: any) => field.onChange(e.value)}
                          // value={field.value}
                        />
                      )}
                    />
                  </Field>
                </HStack>
                <HStack w={"full"}>
                  <Field
                    errorText={errors.imgPerfilPrivacy?.message}
                    invalid={!!errors.imgPerfilPrivacy}
                    label="Foto do perfil"
                  >
                    <Controller
                      name="imgPerfilPrivacy"
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
                    errorText={errors.statusPrivacy?.message}
                    invalid={!!errors.statusPrivacy}
                    label="Status"
                    disabled
                  >
                    <Controller
                      name="statusPrivacy"
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
                    errorText={errors.groupsAddPrivacy?.message}
                    invalid={!!errors.groupsAddPrivacy}
                    label="Adicionar aos grupos"
                  >
                    <Controller
                      name="groupsAddPrivacy"
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
                    errorText={errors.readReceiptsPrivacy?.message}
                    invalid={!!errors.readReceiptsPrivacy}
                    label="Confirmação de leitura"
                    disabled
                  >
                    <Controller
                      name="readReceiptsPrivacy"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          name={field.name}
                          isMulti={false}
                          isDisabled
                          onBlur={field.onBlur}
                          options={optionsReadReceiptsValue}
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
